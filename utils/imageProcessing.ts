
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * 전역 픽셀 스캔(Global Scan)을 사용하여 배경을 제거합니다.
 * 이미지의 좌측 상단 픽셀 색상을 자동으로 감지하여 해당 색상과 유사한 모든 픽셀을 투명하게 만듭니다.
 * 이 방식은 AI가 생성한 배경색의 미세한 변화(Tone shift)를 자동으로 보정하여 제거합니다.
 */
export async function removeCharacterImageBackground(baseImage: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous"; // CORS 이슈 방지
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                reject(new Error("Canvas context를 생성할 수 없습니다."));
                return;
            }

            ctx.drawImage(img, 0, 0);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            // 1. Auto-detect background color from the top-left pixel
            // 이미지의 좌측 상단(0,0) 픽셀을 배경색의 기준으로 삼습니다.
            const bgR = data[0];
            const bgG = data[1];
            const bgB = data[2];

            // 2. Determine Threshold Strategy
            // 감지된 배경색이 마젠타 계열(#FF00FF 근처)인지 확인합니다.
            const isMagenta = (bgR > 200 && bgG < 100 && bgB > 200);
            
            // 마젠타라면 100까지 허용(공격적 제거), 아니면 30(보수적 제거)
            const threshold = isMagenta ? 100 : 30;

            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];

                // 유클리드 거리 계산 (Euclidean distance)으로 색상 차이 측정
                const distance = Math.sqrt(
                    Math.pow(r - bgR, 2) +
                    Math.pow(g - bgG, 2) +
                    Math.pow(b - bgB, 2)
                );

                // 거리가 임계값보다 작으면(배경색과 비슷하면) 투명하게 처리
                if (distance < threshold) {
                    data[i + 3] = 0; // Alpha = 0 (투명)
                }
            }

            ctx.putImageData(imageData, 0, 0);
            resolve(canvas.toDataURL('image/png'));
        };

        img.onerror = () => {
            reject(new Error("이미지를 로드하는 데 실패했습니다."));
        };

        img.src = baseImage;
    });
}
