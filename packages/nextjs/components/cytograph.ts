import { ComputePositionConfig } from '@floating-ui/dom';

declare module 'cytoscape-popper' {
    interface PopperOptions extends ComputePositionConfig {
    }
    interface PopperInstance {
        update(): void;
    }
}

import cytoscape from 'cytoscape';
import cytoscapePopper from 'cytoscape-popper';

import {
    computePosition,
    flip,
    shift,
    limitShift,
} from '@floating-ui/dom';

export function popperFactory(ref: any, content: any, opts: any) {
    // see https://floating-ui.com/docs/computePosition#options
    const popperOptions = {
        // matching the default behaviour from Popper@2
        // https://floating-ui.com/docs/migration#configure-middleware
        middleware: [
            flip(),
            shift({ limiter: limitShift() })
        ],
        ...opts,
    }

    function update() {
        computePosition(ref, content, opts).then(({ x, y }) => {
            Object.assign(content.style, {
                left: `${x}px`,
                top: `${y}px`,
            });
        });
    }
    update();
    return { update };
}

cytoscape.use(cytoscapePopper(popperFactory));
