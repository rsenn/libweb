// from: https://github.com/juhl/html5-audio-fft-equalizer

export function triangular_window(x) {
  return 1 - Math.abs(1 - 2 * x);
}

export function cosine_window(x) {
  return Math.cos(Math.PI * x - Math.PI / 2);
}

export function hamming_window(x) {
  return 0.54 - 0.46 * Math.cos(2 * Math.PI * x);
}

export function hann_window(x) {
  return 0.5 * (1 - Math.cos(2 * Math.PI * x));
}

export function window(buffer,
  size,
  stride,
  stride_offset,
  win = hamming_window
) {
  for(var i = 0; i < size; i++) {
    buffer[i * stride + stride_offset] *= win(i / (size - 1));
    //buffer[i * stride + stride_offset] *= triangular_window(i / (size - 1));
    //buffer[i * stride + stride_offset] *= cosine_window(i / (size - 1));
    //buffer[i * stride + stride_offset] *= hann_window(i / (size - 1));
  }
}

export function butterworth_filter(x, n, d0) {
  return 1 / (1 + Math.pow(Math.abs(x) / d0, 2 * n));
}

export function eq_filter(x) {
  var seq = eq[selected_eq];
  var sum = 1;
  for(var i = 0; i < EQ_BAND_COUNT; i++) {
    sum +=
      seq[EQ_BAND_COUNT - 1 - i] * butterworth_filter(x * (2 << i) - 1, 2, 0.4);
  }
  return sum;
}

export function db_to_mag(db) {
  return Math.pow(10, db / 10);
}

export function mag_to_db(mag) {
  return 10 * (Math.log(mag) / Math.log(10));
}
