import React, { useEffect, useState } from "react";

const API_URL = "http://localhost:5000/api/dropbox";

function DropboxUpload() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [connected, setConnected] = useState(false);

    // =====================================================
    // CHECK DROPBOX CONNECTION
    // =====================================================

    const checkConnection = async () => {
        try {
            const response = await fetch(`${API_URL}/status`);
            const data = await response.json();

            setConnected(data.connected);

            return data.connected;
        } catch (error) {
            console.error(
                "Dropbox status error:",
                error
            );

            setConnected(false);
            return false;
        }
    };


    // =====================================================
    // LOAD DROPBOX FILES
    // =====================================================

    const loadFiles = async () => {
        try {
            const response = await fetch(
                `${API_URL}/files`
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to load Dropbox files"
                );
            }

            setFiles(data);

        } catch (error) {
            console.error(
                "Load files error:",
                error
            );
        }
    };


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {

        const initializeDropbox = async () => {

            const isConnected =
                await checkConnection();

            if (isConnected) {
                await loadFiles();
            }
        };

        initializeDropbox();

    }, []);


    // =====================================================
    // CONNECT DROPBOX
    // =====================================================

    const connectDropbox = () => {
        window.location.href =
            `${API_URL}/auth`;
    };


    // =====================================================
    // FILE SELECT
    // =====================================================

    const handleFileChange = (event) => {

        const file = event.target.files[0];

        if (!file) {
            setSelectedFile(null);
            return;
        }

        setSelectedFile(file);
    };


    // =====================================================
    // UPLOAD FILE
    // =====================================================

    const handleUpload = async () => {

        if (!selectedFile) {
            alert("Please select a file first.");
            return;
        }

        if (!connected) {
            alert("Please connect Dropbox first.");
            return;
        }

        try {

            setLoading(true);

            const formData = new FormData();

            formData.append(
                "file",
                selectedFile
            );

            const response = await fetch(
                `${API_URL}/upload`,
                {
                    method: "POST",
                    body: formData
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Upload failed"
                );
            }

            alert(
                "File uploaded successfully to Dropbox!"
            );

            console.log(
                "Uploaded file:",
                data.file
            );

            setSelectedFile(null);

            // Reset file input
            const fileInput =
                document.getElementById(
                    "dropbox-file-input"
                );

            if (fileInput) {
                fileInput.value = "";
            }

            await loadFiles();

        } catch (error) {

            console.error(
                "Dropbox upload error:",
                error
            );

            alert(
                error.message ||
                "Could not upload to Dropbox"
            );

        } finally {

            setLoading(false);
        }
    };


    // =====================================================
    // VIEW FILE
    // =====================================================

    const handleView = async (path) => {

        try {

            const response = await fetch(
                `${API_URL}/view?path=${encodeURIComponent(path)}`
            );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Could not get file link"
                );
            }

            window.open(
                data.link,
                "_blank"
            );

        } catch (error) {

            console.error(
                "View error:",
                error
            );

            alert(
                error.message ||
                "Could not view file"
            );
        }
    };


    // =====================================================
    // DELETE FILE
    // =====================================================

    const handleDelete = async (path) => {

        const confirmDelete =
            window.confirm(
                "Are you sure you want to delete this file?"
            );

        if (!confirmDelete) {
            return;
        }

        try {

            const response = await fetch(
                `${API_URL}/delete`,
                {
                    method: "DELETE",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        path: path
                    })
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Delete failed"
                );
            }

            alert(
                "File deleted successfully!"
            );

            await loadFiles();

        } catch (error) {

            console.error(
                "Delete error:",
                error
            );

            alert(
                error.message ||
                "Could not delete file"
            );
        }
    };


    // =====================================================
    // FORMAT FILE SIZE
    // =====================================================

    const formatFileSize = (bytes) => {

        if (!bytes) {
            return "0 KB";
        }

        if (bytes < 1024) {
            return `${bytes} B`;
        }

        if (bytes < 1024 * 1024) {
            return `${(
                bytes / 1024
            ).toFixed(1)} KB`;
        }

        return `${(
            bytes /
            (1024 * 1024)
        ).toFixed(1)} MB`;
    };


    // =====================================================
    // RENDER
    // =====================================================

    return (
        <div
            style={{
                padding: "20px",
                marginTop: "20px",
                border: "1px solid #ddd",
                borderRadius: "12px"
            }}
        >

            <h2>
                Dropbox Media Storage
            </h2>


            {/* CONNECTION STATUS */}

            <div style={{ marginBottom: "20px" }}>

                {connected ? (

                    <div>
                        <p
                            style={{
                                color: "green",
                                fontWeight: "bold"
                            }}
                        >
                            ✓ Dropbox Connected
                        </p>

                        <button
                            onClick={loadFiles}
                        >
                            Refresh Files
                        </button>
                    </div>

                ) : (

                    <div>

                        <p
                            style={{
                                color: "red",
                                fontWeight: "bold"
                            }}
                        >
                            Dropbox Not Connected
                        </p>

                        <button
                            onClick={connectDropbox}
                        >
                            Connect Dropbox
                        </button>

                    </div>

                )}

            </div>


            {/* UPLOAD SECTION */}

            {connected && (

                <div
                    style={{
                        marginBottom: "30px"
                    }}
                >

                    <h3>
                        Upload Image / Video
                    </h3>

                    <input
                        id="dropbox-file-input"
                        type="file"
                        accept="image/*,video/*"
                        onChange={
                            handleFileChange
                        }
                    />

                    {selectedFile && (

                        <p>
                            Selected:{" "}
                            <strong>
                                {selectedFile.name}
                            </strong>
                        </p>

                    )}

                    <button
                        onClick={handleUpload}
                        disabled={
                            !selectedFile ||
                            loading
                        }
                        style={{
                            marginTop: "10px",
                            padding: "8px 16px",
                            cursor:
                                selectedFile &&
                                !loading
                                    ? "pointer"
                                    : "not-allowed"
                        }}
                    >

                        {loading
                            ? "Uploading..."
                            : "Upload to Dropbox"}

                    </button>

                </div>

            )}


            {/* FILE LIST */}

            {connected && (

                <div>

                    <h3>
                        Dropbox Files
                    </h3>

                    {files.length === 0 ? (

                        <p>
                            No files found in Dropbox.
                        </p>

                    ) : (

                        <div>

                            {files.map((file) => (

                                <div
                                    key={file.id}
                                    style={{
                                        display: "flex",
                                        justifyContent:
                                            "space-between",
                                        alignItems:
                                            "center",
                                        padding: "12px",
                                        marginBottom:
                                            "10px",
                                        border:
                                            "1px solid #ddd",
                                        borderRadius:
                                            "8px"
                                    }}
                                >

                                    <div>

                                        <strong>
                                            {file.name}
                                        </strong>

                                        <br />

                                        <small>
                                            {file.size
                                                ? formatFileSize(
                                                    file.size
                                                )
                                                : "Folder"}
                                        </small>

                                    </div>


                                    <div>

                                        {file[".tag"] ===
                                            "file" && (

                                                <button
                                                    onClick={() =>
                                                        handleView(
                                                            file.path_display
                                                        )
                                                    }
                                                    style={{
                                                        marginRight:
                                                            "8px"
                                                    }}
                                                >
                                                    View
                                                </button>

                                            )}


                                        {file[".tag"] ===
                                            "file" && (

                                                <button
                                                    onClick={() =>
                                                        handleDelete(
                                                            file.path_display
                                                        )
                                                    }
                                                >
                                                    Delete
                                                </button>

                                            )}

                                    </div>

                                </div>

                            ))}

                        </div>

                    )}

                </div>

            )}

        </div>
    );
}

export default DropboxUpload;