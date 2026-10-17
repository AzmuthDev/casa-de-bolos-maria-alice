const { Jimp } = require('jimp');
const path = require('path');

async function removeBackground() {
    try {
        const imagePath = path.join(__dirname, 'public', 'logo.png');
        const outputPath = path.join(__dirname, 'public', 'logo-transparent-v2.png');
        
        console.log('Reading image from:', imagePath);
        const image = await Jimp.read(imagePath);
        
        image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
            const r = this.bitmap.data[idx + 0];
            const g = this.bitmap.data[idx + 1];
            const b = this.bitmap.data[idx + 2];
            
            // More aggressive threshold to catch off-white and anti-aliasing
            if (r > 220 && g > 220 && b > 220) {
                this.bitmap.data[idx + 3] = 0;
            }
        });
        
        await image.write(outputPath);
        console.log('Background removed successfully: ' + outputPath);
    } catch (error) {
        console.error('Error processing image:', error);
    }
}

removeBackground();
