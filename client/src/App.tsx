// @deno-types="@types/react"
import { useState } from "react";
import "./App.css";

function downloadFileJS(data: Blob, type: string, name: string) {
  const blob = new Blob([data], { type });
  const url = globalThis.URL.createObjectURL(blob);
  downloadURI(url, name);
  globalThis.URL.revokeObjectURL(url);
}

function downloadURI(uri: string, name: string) {
  const link = document.createElement("a");
  link.download = name;
  link.href = uri;
  link.click();
}

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      console.log("Selected file:", file.name);
    }
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData();
    console.log(selectedFile);

    if (!selectedFile) return;

    const file = new File([selectedFile], selectedFile.name, {
      type: selectedFile.type,
    });

    formData.set("file", file);

    fetch("/upload", {
      method: "POST",
      type: "multipart/form-data",
      body: formData,
    })
      .then((response) => response.blob())
      .then((data) => {
        downloadFileJS(
          data,
          "audio/mp3",
          selectedFile.name.replace(/mp4$/, "mp3")
        );
      });
  };

  return (
    <div>
      <div className="app-container">
        <form method="post" encType="multipart/form-data" onSubmit={onSubmit}>
          <input type="file" onChange={handleFileChange} accept="video/*" />
          {selectedFile && <button onClick={() => {}}>get audio</button>}
        </form>
        {selectedFile && <p>Selected file: {selectedFile.name}</p>}
      </div>

      {selectedFile && (
        <div>
          <video controls>
            <source src={URL.createObjectURL(selectedFile)} type="video/mp4" />
          </video>
        </div>
      )}
    </div>
  );
}

export default App;
