self.requestFileSystemSync = self.webkitRequestFileSystemSync ||
                                self.requestFileSystemSync;

var paths = []; // Global to hold the list of entry filesystem URLs.

function getAllEntries(dirReader) {
    var entries = dirReader.readEntries();

    for (var i = 0, entry; entry = entries[i]; ++i) {
    paths.push(entry.toURL()); // Stash this entry's filesystem: URL.

    // If this is a directory, we have more traversing to do.
    if (entry.isDirectory) {
        getAllEntries(entry.createReader());
    }
    }
}

function onError(e) {
    postMessage('ERROR: ' + e.toString()); // Forward the error to main app.
}

self.onmessage = function(e) {
    var data = e.data;

    // Ignore everything else except our 'list' command.
    if (!data.cmd || data.cmd != 'list') {
    return;
    }

    try {
    var fs = requestFileSystemSync(TEMPORARY, 1024*1024 /*1MB*/);

    getAllEntries(fs.root.createReader());

    self.postMessage({entries: paths});
    } catch (e) {
    onError(e);
    }
};
