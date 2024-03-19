
const Search = () => {
    function render_image(item: any) {
        return `
            <div class="results-image">
            <a href="${item.entry}" class="image-link">
                <img id=${item.score} src="${item.entry}?${Math.random()}"
                    title="Effective Score: ${item.score}, Meta: ${item.additional.metadata_score}, Image: ${item.additional.image_score}"
                    class="image">
            </a>
            </div>`;
    }

    function render_org(query: any, data: any, classPrefix = "") {
        return data.map(function(item: any) {
            var orgParser = new Org.Parser();
            var orgDocument = orgParser.parse(item.entry);
            var orgHTMLDocument = orgDocument.convert(Org.ConverterHTML, { htmlClassPrefix: classPrefix, suppressNewLines: true });
            return `<div class="results-org">` + orgHTMLDocument.toString() + `</div>`;
        }).join("\n");
    }

    function render_markdown(query: any, data: any) {
        var md = window.markdownit();
        return data.map(function(item) {
            let rendered = "";
            if (item.additional.file.startsWith("http")) {
                lines = item.entry.split("\n");
                rendered = md.render(`${lines[0]}\t[*](${item.additional.file})\n${lines.slice(1).join("\n")}`);
            }
            else {
                rendered = md.render(`${item.entry}`);
            }
            return `<div class="results-markdown">` + rendered + `</div>`;
        }).join("\n");
    }

    function render_pdf(query: any, data: any) {
        return data.map(function(item) {
            let compiled_lines = item.additional.compiled.split("\n");
            let filename = compiled_lines.shift();
            let text_match = compiled_lines.join("\n")
            return `<div class="results-pdf">` + `<h2>${filename}</h2>\n<p>${text_match}</p>` + `</div>`;
        }).join("\n");
    }

    function render_html(query: any, data: any) {
        return data.map(function(item) {
            let document = new DOMParser().parseFromString(item.entry, "text/html");
            // Scrub the HTML to remove any script tags and associated content
            let script_tags = document.querySelectorAll("script");
            for (let i = 0; i < script_tags.length; i++) {
                script_tags[i].remove();
            }
            // Scrub the HTML to remove any style tags and associated content
            let style_tags = document.querySelectorAll("style");
            for (let i = 0; i < style_tags.length; i++) {
                style_tags[i].remove();
            }
            // Scrub the HTML to remove any noscript tags and associated content
            let noscript_tags = document.querySelectorAll("noscript");
            for (let i = 0; i < noscript_tags.length; i++) {
                noscript_tags[i].remove();
            }
            // Scrub the HTML to remove any iframe tags and associated content
            let iframe_tags = document.querySelectorAll("iframe");
            for (let i = 0; i < iframe_tags.length; i++) {
                iframe_tags[i].remove();
            }
            // Scrub the HTML to remove any object tags and associated content
            let object_tags = document.querySelectorAll("object");
            for (let i = 0; i < object_tags.length; i++) {
                object_tags[i].remove();
            }
            // Scrub the HTML to remove any embed tags and associated content
            let embed_tags = document.querySelectorAll("embed");
            for (let i = 0; i < embed_tags.length; i++) {
                embed_tags[i].remove();
            }
            let scrubbedHTML = document.body.outerHTML;
            return `<div class="results-html">` + scrubbedHTML + `</div>`;
        }).join("\n");
    }

    function render_xml(query: any, data: any) {
        return data.map(function(item: any) {
            return `<div class="results-xml">` +
                `<b><a href="${item.additional.file}">${item.additional.heading}</a></b>` +
                `<xml>${item.entry}</xml>` +
                `</div>`
        }).join("\n");
    }

    function render_multiple(query: any, data: any, type: any) {
        let html = "";
        data.forEach(item => {
            if (item.additional.file.endsWith(".org")) {
                html += render_org(query, [item], "org-");
            } else if (
                item.additional.file.endsWith(".md") ||
                item.additional.file.endsWith(".markdown") ||
                (item.additional.file.includes("issues") && item.additional.source === "github") ||
                (item.additional.file.includes("commit") && item.additional.source === "github")
            ) {
                html += render_markdown(query, [item]);
            } else if (item.additional.file.endsWith(".pdf")) {
                html += render_pdf(query, [item]);
            } else if (item.additional.source == "notion") {
                html += `<div class="results-notion">` + `<b><a href="${item.additional.file}">${item.additional.heading}</a></b>` + `<p>${item.entry}</p>` + `</div>`;
            } else if (item.additional.file.endsWith(".html")) {
                html += render_html(query, [item]);
            } else if (item.additional.file.endsWith(".xml")) {
                html += render_xml(query, [item])
            } else {
                html += `<div class="results-plugin">` + `<b><a href="${item.additional.file}">${item.additional.heading}</a></b>` + `<p>${item.entry}</p>` + `</div>`;
            }
        });
        return html;
    }

    function render_results(data: any, query: any, type: any) {
        let results = "";
        if (type === "markdown") {
            results = render_markdown(query, data);
        } else if (type === "org") {
            results = render_org(query, data, "org-");
        } else if (type === "image") {
            results = data.map(render_image).join('');
        } else if (type === "pdf") {
            results = render_pdf(query, data);
        } else if (type === "github" || type === "all" || type === "notion") {
            results = render_multiple(query, data, type);
        } else {
            results = data.map((item: any) => `<div class="results-plugin">` + `<p>${item.entry}</p>` + `</div>`).join("\n")
        }

        // Any POST rendering goes here.

        let renderedResults = document.createElement("div");
        renderedResults.id = `results-${type}`;
        renderedResults.innerHTML = results;

        // For all elements that are of type img in the results html and have a src with 'avatar' in the URL, add the class 'avatar'
        // This is used to make the avatar images round
        let images = renderedResults.querySelectorAll("img[src*='avatar']");
        for (let i = 0; i < images.length; i++) {
            images[i].classList.add("avatar");
        }

        return renderedResults.outerHTML;
    }

    async function search(rerank = false) {
        // Extract required fields for search from form
        query = document.getElementById("query").value.trim();
        type = 'all';
        results_count = localStorage.getItem("khojResultsCount") || 5;
        console.log(`Query: ${query}, Type: ${type}, Results Count: ${results_count}`);

        // Short circuit on empty query
        if (query.length === 0) {
            return;
        }

        // If set query field in url query param on rerank
        if (rerank)
            setQueryFieldInUrl(query);

        // Execute Search and Render Results
        url = await createRequestUrl(query, type, results_count || 5, rerank);
        const khojToken = await window.tokenAPI.getToken();
        const headers = { 'Authorization': `Bearer ${khojToken}` };

        fetch(url, { headers })
            .then(response => response.json())
            .then(data => {
                document.getElementById("results").innerHTML = render_results(data, query, type);
            });
    }

    let debounceTimeout;
    function incrementalSearch(event) {
        // Run incremental search only after waitTime passed since the last key press
        let waitTime = 300;
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
            type = 'all';
            // Search with reranking on 'Enter'
            let should_rerank = event.key === 'Enter';
            search(rerank = should_rerank);
        }, waitTime);
    }

    async function populate_type_dropdown() {
        const hostURL = await window.hostURLAPI.getURL();
        const khojToken = await window.tokenAPI.getToken();
        const headers = { 'Authorization': `Bearer ${khojToken}` };

        // Populate type dropdown field with enabled content types only
        fetch(`${hostURL}/api/config/types`, { headers })
            .then(response => response.json())
            .then(enabled_types => {
                // Show warning if no content types are enabled
                if (enabled_types.detail) {
                    document.getElementById("results").innerHTML = "<div id='results-error'>To use Khoj search, setup your content plugins on the Khoj <a class='inline-chat-link' href='/config'>settings page</a>.</div>";
                    document.getElementById("query").setAttribute("disabled", "disabled");
                    document.getElementById("query").setAttribute("placeholder", "Configure Khoj to enable search");
                    return [];
                }

                return enabled_types;
            });
    }

    async function createRequestUrl(query, type, results_count, rerank) {
        // Generate Backend API URL to execute Search
        const hostURL = await window.hostURLAPI.getURL();

        let url = `${hostURL}/api/search?q=${encodeURIComponent(query)}&n=${results_count}&client=web`;
        // If type is not 'all', append type to URL
        if (type !== 'all')
            url += `&t=${type}`;
        // Rerank is only supported by text types
        if (type !== "image")
            url += `&r=${rerank}`;
        return url;
    }

    function setQueryFieldInUrl(query: any) {
        var url = new URL(window.location.href);
        url.searchParams.set("q", query);
        window.history.pushState({}, "", url.href);
    }

    window.addEventListener("load", async function() {
        // Dynamically populate type dropdown based on enabled content types and type passed as URL query parameter
        await populate_type_dropdown();

        // Fill query field with value passed in URL query parameters, if any.
        var query_via_url = new URLSearchParams(window.location.search).get("q");
        if (query_via_url)
            document.getElementById("query").value = query_via_url;
    });
    (
        <div>
            <div className="khoj-header">
                <a className="khoj-logo" href="./index.html">
                    <img className="khoj-logo" src="./assets/icons/khoj-logo-sideways-500.png" alt="Khoj"></img>
                </a>
                <nav className="khoj-nav">
                    <a className="khoj-nav" href="./chat.html">💬 Chat</a>
                    <a className="khoj-nav khoj-nav-selected" href="./search.html">🔎 Search</a>
                    <a className="khoj-nav" href="./config.html">⚙️ Settings</a>
                </nav>
            </div>

            <input type="text" id="query" className="option" onKeyDown={() => incrementalSearch(event)} autoFocus={true} placeholder="Search your knowledge base using natural language" />

            <div id="results"></div>
        </div>
    )
}


