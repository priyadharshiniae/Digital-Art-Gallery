import { useState } from "react";
import { db, storage } from "../firebase";

import { collection, addDoc, serverTimestamp } from "firebase/firestore";

import {
    ref,
    uploadBytes,
    getDownloadURL,
} from "firebase/storage";

const ArtworkForm = () => {
    const [title, setTitle] = useState("");
    const [artist, setArtist] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [image, setImage] = useState(null);

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!image) {
            alert("Please select an image.");
            return;
        }

        try {
            setLoading(true);

            // Upload image
            const imageRef = ref(
                storage,
                `artworks/${Date.now()}-${image.name}`
            );

            await uploadBytes(imageRef, image);

            const imageURL = await getDownloadURL(imageRef);

            // Save artwork data
            await addDoc(collection(db, "artworks"), {
                title,
                artist,
                description,
                category,
                imageURL,
                createdAt: serverTimestamp(),
            });

            alert("Artwork uploaded successfully!");

            setTitle("");
            setArtist("");
            setDescription("");
            setCategory("");
            setImage(null);

            document.getElementById("imageInput").value = "";
        } catch (err) {
            console.error(err);
            alert("Upload failed.");
        }

        setLoading(false);
    };

    return (
        <div className="upload-container">

            <h2>Upload Artwork</h2>

            <form onSubmit={handleSubmit}>

                <input
                    type="text"
                    placeholder="Artwork Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />

                <input
                    type="text"
                    placeholder="Artist Name"
                    value={artist}
                    onChange={(e) => setArtist(e.target.value)}
                    required
                />

                <input
                    type="text"
                    placeholder="Category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                />

                <textarea
                    placeholder="Description"
                    rows="5"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />

                <input
                    id="imageInput"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImage(e.target.files[0])}
                    required
                />

                <button type="submit" disabled={loading}>
                    {loading ? "Uploading..." : "Upload Artwork"}
                </button>

            </form>

        </div>
    );
};

export default ArtworkForm;