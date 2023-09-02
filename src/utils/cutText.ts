export function cutText(text: string) {
	if (text.length > 100) {
		return text.slice(0, 97) + "...";
	}
	return text;
}