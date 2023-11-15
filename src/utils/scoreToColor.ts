export function scoreToColor(score: number): string {
  let red, green, blue;

  if (score <= 50) {
    // 0에서 50 사이: 빨간색에서 하얀색으로
    red = 255;
    green = blue = Math.round((score / 50) * 255);
  } else {
    // 50에서 100 사이: 하얀색에서 초록색으로
    green = 255;
    red = blue = Math.round((1 - (score - 50) / 50) * 255);
  }

  return `rgba(${red},${green},${blue},1)`;
}
