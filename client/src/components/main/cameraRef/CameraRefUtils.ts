/**
 * Converts raw camera reference text into markdown-style links.
 */
export default function preprocessCameraRefs(text: string) {
  return text.replace(/(#camera-[A-Za-z]+\(.*?\)(?:-[A-Za-z]+\(.*?\))?)/g, '[$1]($1)');
}
