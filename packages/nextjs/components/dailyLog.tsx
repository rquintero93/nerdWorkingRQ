const DailyLog = () => {
    return (


        <div className="text-gray-800">
            <div className="container mx-auto p-8">
                <div className="max-w-2xl mx-auto bg-gray-100 p-6 rounded-lg shadow">
                    <div className="mb-4">
                        <input type="text" placeholder="Search..." className="w-full p-2 rounded border border-gray-300" />
                    </div>
                    <h1 className="text-xl font-semibold text-gray-700 mb-4">Daily Quest Log</h1>
                    <div className="space-y-4">
                        <div className="flex items-center">
                            <span className="flex-grow">{"->"} R&D Report <a href="#" className="report-link text-blue-500">link</a> by:</span>
                            <input type="text" className="flex-1 p-1 border-b border-gray-300 focus:outline-none" />
                            <input type="radio" name="report" className="ml-2" />
                        </div>
                        <div className="flex items-center">
                            <span className="flex-grow">{"->"} DevWork Report <a href="#" className="report-link text-blue-500">link</a> by:</span>
                            <input type="text" className="flex-1 p-1 border-b border-gray-300 focus:outline-none" />
                            <input type="radio" name="report" className="ml-2" />
                        </div>
                        <div className="flex items-center">
                            <span className="flex-grow">{"->"} Comms Report <a href="#" className="report-link text-blue-500">link</a> by:</span>
                            <input type="text" className="flex-1 p-1 border-b border-gray-300 focus:outline-none" />
                            <input type="radio" name="report" className="ml-2" />
                        </div>
                        <div className="flex items-center">
                            <span className="flex-grow">{"->"} Treasury Report <a href="#" className="report-link text-blue-500">link</a> by:</span>
                            <input type="text" className="flex-1 p-1 border-b border-gray-300 focus:outline-none" />
                            <input type="radio" name="report" className="ml-2" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DailyLog;
