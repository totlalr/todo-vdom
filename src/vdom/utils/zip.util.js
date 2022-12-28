export const zip = (xs, ys) => {
    const zipped = [];
    for (let i = 0; i < Math.max(xs.length, ys.length); i++) {
      zipped.push([xs[i], ys[i]]);
    }
    return zipped;
  };