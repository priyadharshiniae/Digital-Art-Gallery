import "./App.css";
import { useEffect, useState } from "react";
import DropboxUpload from "./components/DropboxUpload";

import { auth, db } from "./firebase";

import {
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
} from "firebase/auth";

import {
    collection,
    addDoc,
    onSnapshot,
    serverTimestamp,
    query,
    orderBy,
    updateDoc,
    deleteDoc,
    doc,
} from "firebase/firestore";

function App() {
    const [user, setUser] = useState(null);

    const [title, setTitle] = useState("");
    const [artist, setArtist] = useState("");
    const [category, setCategory] = useState("");
    const [description, setDescription] = useState("");

    const [artworks, setArtworks] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // Google Login
    const login = async () => {
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Login error:", error);
            alert("Google Login failed: " + error.message);
        }
    };

    // Logout
    const logout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Logout error:", error);
            alert("Logout failed: " + error.message);
        }
    };

    // Check Login Status
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });

        return unsubscribe;
    }, []);

    // Read Artworks from Firestore
    useEffect(() => {
        const q = query(
            collection(db, "artworks"),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const artworkList = snapshot.docs.map((document) => ({
                    id: document.id,
                    ...document.data(),
                }));

                setArtworks(artworkList);
            },
            (error) => {
                console.error("Firestore read error:", error);
                alert("Unable to load artworks: " + error.message);
            }
        );

        return unsubscribe;
    }, []);

    // Clear Form
    const clearForm = () => {
        setTitle("");
        setArtist("");
        setCategory("");
        setDescription("");
        setEditingId(null);
    };

    // Add Artwork to Firestore
    const addArtwork = async (e) => {
        e.preventDefault();

        if (!user) {
            alert("Please login first.");
            return;
        }

        if (
            !title.trim() ||
            !artist.trim() ||
            !category.trim() ||
            !description.trim()
        ) {
            alert("Please fill in all fields.");
            return;
        }

        try {
            await addDoc(collection(db, "artworks"), {
                title: title.trim(),
                artist: artist.trim(),
                category: category.trim(),
                description: description.trim(),
                user: user.displayName || "Guest",
                userId: user.uid,
                createdAt: serverTimestamp(),
            });

            clearForm();
            setShowForm(false);
            alert("Artwork added successfully!");
        } catch (error) {
            console.error("Firestore save error:", error);
            alert("Failed to save artwork: " + error.message);
        }
    };

    // Start Editing
    const startEdit = (artwork) => {
        setTitle(artwork.title || "");
        setArtist(artwork.artist || "");
        setCategory(artwork.category || "");
        setDescription(artwork.description || "");
        setEditingId(artwork.id);
        setShowForm(true);

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    // Update Artwork in Firestore
    const updateArtwork = async (e) => {
        e.preventDefault();

        if (!user) {
            alert("Please login first.");
            return;
        }

        if (
            !title.trim() ||
            !artist.trim() ||
            !category.trim() ||
            !description.trim()
        ) {
            alert("Please fill in all fields.");
            return;
        }

        if (!editingId) {
            alert("No artwork selected for editing.");
            return;
        }

        try {
            await updateDoc(doc(db, "artworks", editingId), {
                title: title.trim(),
                artist: artist.trim(),
                category: category.trim(),
                description: description.trim(),
            });

            clearForm();
            setShowForm(false);
            alert("Artwork updated successfully!");
        } catch (error) {
            console.error("Firestore update error:", error);
            alert("Failed to update artwork: " + error.message);
        }
    };

    // Delete Artwork from Firestore
    const deleteArtwork = async (artwork) => {
        if (!user) {
            alert("Please login first.");
            return;
        }

        if (
            artwork.userId !== user.uid
        ) {
            alert("You can only delete your own artworks.");
            return;
        }

        const confirmed = window.confirm(
            "Are you sure you want to delete this artwork?"
        );

        if (!confirmed) return;

        try {
            await deleteDoc(doc(db, "artworks", artwork.id));
            alert("Artwork deleted successfully!");
        } catch (error) {
            console.error("Firestore delete error:", error);
            alert("Failed to delete artwork: " + error.message);
        }
    };

    // Cancel Editing
    const cancelEdit = () => {
        clearForm();
        setShowForm(false);
    };

    return (
        <div className="app">
            {/* Hero Section */}
            <section className="hero">
                <div className="overlay">
                    <nav className="navbar">
                        <h2 className="logo">🎨 DigiArt</h2>

                        <div className="nav-links">
                            <a href="#gallery">Gallery</a>

                            {user ? (
                                <>
                  <span>
                    {user.displayName || user.email}
                  </span>

                                    <button
                                        className="secondary-btn"
                                        onClick={logout}
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <button
                                    className="primary-btn"
                                    onClick={login}
                                >
                                    Google Login
                                </button>
                            )}
                        </div>
                    </nav>

                    <div className="hero-content">
                        <h1>
                            Discover the World of
                            <span> Digital Art</span>
                        </h1>

                        <p>
                            Explore digital paintings, AI art, photography
                            and creative works from artists.
                        </p>

                        {user && (
                            <button
                                className="primary-btn"
                                onClick={() => setShowForm(!showForm)}
                            >
                                {showForm ? "Close Form" : "Add Artwork"}
                            </button>
                        )}
                    </div>
                </div>
            </section>

            {/* Add / Edit Form */}
            {showForm && user && (
                <div
                    style={{
                        maxWidth: "700px",
                        margin: "40px auto",
                        background: "#1f2937",
                        padding: "30px",
                        borderRadius: "15px",
                        color: "white",
                    }}
                >
                    <h2>
                        {editingId ? "Edit Artwork" : "Add Artwork"}
                    </h2>

                    <form onSubmit={editingId ? updateArtwork : addArtwork}>
                        <input
                            type="text"
                            placeholder="Artwork Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            style={inputStyle}
                            required
                        />

                        <input
                            type="text"
                            placeholder="Artist"
                            value={artist}
                            onChange={(e) => setArtist(e.target.value)}
                            style={inputStyle}
                            required
                        />

                        <input
                            type="text"
                            placeholder="Category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            style={inputStyle}
                            required
                        />

                        <textarea
                            placeholder="Description"
                            rows="5"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            style={inputStyle}
                            required
                        />

                        <button
                            className="primary-btn"
                            type="submit"
                        >
                            {editingId ? "Update Artwork" : "Save Artwork"}
                        </button>

                        {editingId && (
                            <button
                                type="button"
                                className="secondary-btn"
                                onClick={cancelEdit}
                                style={{ marginLeft: "10px" }}
                            >
                                Cancel
                            </button>
                        )}
                    </form>

                    <hr
                        style={{
                            margin: "30px 0",
                            border: "1px solid #555",
                        }}
                    />

                    <h2>Upload Artwork Image to Dropbox</h2>
                    <DropboxUpload />
                </div>
            )}

            {/* Gallery */}
            <section id="gallery" className="features">
                <h2
                    style={{
                        width: "100%",
                        textAlign: "center",
                        marginBottom: "30px",
                        color: "white",
                    }}
                >
                    Digital Art Gallery
                </h2>

                {artworks.length === 0 ? (
                    <div
                        style={{
                            color: "white",
                            textAlign: "center",
                            width: "100%",
                        }}
                    >
                        No artworks added yet.
                    </div>
                ) : (
                    artworks.map((art) => (
                        <div className="card" key={art.id}>
                            <h3>{art.title}</h3>

                            <p>
                                <strong>Artist:</strong> {art.artist}
                            </p>

                            <p>
                                <strong>Category:</strong> {art.category}
                            </p>

                            <p>{art.description}</p>

                            <hr style={{ margin: "15px 0" }} />

                            <small>
                                Added by {art.user || "Guest"}
                            </small>

                            {user && art.userId === user.uid && (
                                <div
                                    style={{
                                        marginTop: "20px",
                                        display: "flex",
                                        gap: "10px",
                                    }}
                                >
                                    <button
                                        className="primary-btn"
                                        onClick={() => startEdit(art)}
                                    >
                                        Edit
                                    </button>

                                    <button
                                        className="secondary-btn"
                                        onClick={() => deleteArtwork(art)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </section>
        </div>
    );
}

const inputStyle = {
    width: "100%",
    padding: "12px",
    marginTop: "15px",
    marginBottom: "15px",
    borderRadius: "8px",
    border: "none",
    fontSize: "16px",
    boxSizing: "border-box",
};

export default App;
