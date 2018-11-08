const DownloadNes = (filename = "hack.nes", romData) => {
    console.log(romData);
   const blob = new Blob([new Uint8Array(romData.buffer)], {
       type: "octet/stream"
   });
   const url = window.URL.createObjectURL(blob);
   const a = document.createElement("a");
   a.href = url;
   a.download = filename;
   a.click();
   window.URL.revokeObjectURL(url);
}

export default DownloadNes;