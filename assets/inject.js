function calculateImageSize(dataUrl) {
  // Remove the data URL prefix to get only the base64 data
  const base64 = dataUrl.split(",")[1];
  // Calculate size in bytes
  const sizeInBytes = Math.ceil((base64.length * 3) / 4);
  // Convert to KB
  return sizeInBytes / 1024;
}

async function downloadAllCanvasImages() {
  const btn = document.getElementById("injectedButtonGG");
  btn.textContent = "Đang tải hình...";
  const scrollContainer = document.querySelector(".kix-appview-editor");
  scrollContainer.scrollTop = 0;

  const imageUrls = new Set();

  function getCanvasImageUrls() {
    console.log(`getCanvasImageUrls`);
    const canvases = document.querySelectorAll("canvas");
    const MIN_SIZE_KB = 20;
    canvases.forEach((canvas) => {
      try {
        const imageUrl = canvas.toDataURL("image/png");

        const sizeKB = calculateImageSize(imageUrl);

        if (sizeKB < MIN_SIZE_KB) {
          return;
        }

        if (!imageUrls.has(imageUrl)) {
          imageUrls.add(imageUrl);
        }
      } catch (error) {
        console.warn("Không thể lấy hình từ canvas:", error);
      }
    });
  }

  function scrollPage() {
    return new Promise((resolve) => {
      scrollContainer.scrollBy(0, 400);

      setTimeout(() => {
        getCanvasImageUrls();
        resolve();
      }, 500);
    });
  }

  // Cuộn hết page
  while (scrollContainer.scrollTop < scrollContainer.scrollHeight - window.innerHeight) {
    await scrollPage();
  }

  // Cuộn về đầu trang để reset
  scrollContainer.scrollTop = 0;

  // Đợi một chút để render lại
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Thu thập lại toàn bộ hình
  getCanvasImageUrls();

  const imageUrlArray = Array.from(imageUrls);

  function downloadImage(url, index) {
    const link = document.createElement("a");
    link.href = url;
    link.download = `image_${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Download toàn bộ hình
  // imageUrlArray.forEach((url, index) => {

  //     setTimeout(
  //         () => {
  //             downloadImage(url, index);
  //         },
  //         index * 200 // Delay download every 200ms
  //       );
  // });

  btn.textContent = "Chuẩn bị tải";
  await generatePDFFromCanvas(imageUrlArray);

  btn.textContent = "Tải xong";
  setTimeout(() => {
    btn.textContent = "Download GG for Thanh";
  }, 1000);

  console.log(`Đã download ${imageUrlArray.length} hình ảnh`);
}
async function generatePDFFromCanvas(imageUrls) {
  const pdf = new jsPDF(); // Initialize jsPDF instance
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  for (const [index, imageUrl] of imageUrls.entries()) {
    const img = new Image();
    // Wait for image to load
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = imageUrl;
    });

    // Calculate dimensions to fit on PDF page
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgRatio = img.width / img.height;
    let imgWidth = pageWidth - 1; // 1px margin on each side
    let imgHeight = imgWidth / imgRatio;

    // If image height is too large, scale it down
    if (imgHeight > pageHeight - 1) {
      imgHeight = pageHeight - 1;
      imgWidth = imgHeight * imgRatio;
    }

    // Calculate centering
    const x = (pageWidth - imgWidth) / 2;
    const y = (pageHeight - imgHeight) / 2;

    // Add new page for each image except the first one
    if (index > 0) {
      pdf.addPage();
    }

    // Add image to PDF
    pdf.addImage(img, "PNG", x, y, imgWidth, imgHeight);
  }

  pdf.save("canvas_images.pdf");
}
// Chạy hàm
// downloadAllCanvasImages();

window.downloadAllCanvasImages = downloadAllCanvasImages;
console.log("========= inject.js loaded", downloadAllCanvasImages);

function createButon() {
  if (document.getElementById("injectedButtonGG")) return;

  const button = document.createElement("button");
  button.textContent = "Download GG for Thanh";
  button.style.position = "fixed";
  button.style.bottom = "10px";
  button.style.left = "10px";
  button.style.zIndex = 1000;
  button.style.backgroundColor = "#007bff";
  button.style.color = "white";
  button.style.padding = "10px";
  button.style.border = "none";
  button.id = "injectedButtonGG";

  button.addEventListener("click", () => {
    downloadAllCanvasImages();
  });

  document.body.appendChild(button);
}

createButon();
