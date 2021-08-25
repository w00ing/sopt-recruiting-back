const sizePrefix = {
  huge: '_800x800',
  big: '_400x400',
  large: '_200x200',
  medium: '_100x100',
  small: '_75x75',
  tiny: '_50x50',
  mini: '_20x20',
};

const rawImageResize = (imageUrl, size = 'big') => {
  if (!imageUrl) return null;
  if (size === 'raw') return imageUrl;

  const extensionRegex = /(\.jpg)|(\.png)|(\.webp)|(\.jpeg)/i;
  const extension = extensionRegex.exec(imageUrl)[0];

  return imageUrl.replace(extension, `${sizePrefix[size]}${extension}`);
};

const schoolRawImageResize = (schools, imageKey = 'image', size) => {
  if (schools.length < 1) return;
  for (let i = 0; i < schools.length; i++) {
    schools[i].imageRaw = schools[i][imageKey];
    schools[i][imageKey] = rawImageResize(schools[i][imageKey], size);
  }
};

module.exports = { rawImageResize, schoolRawImageResize };
