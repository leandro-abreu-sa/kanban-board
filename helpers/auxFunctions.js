function isFileValid(file) {
	const type = file.type.split('/').pop();

	const validTypes = ['pdf'];

	if (validTypes.indexOf(type) === -1) return false;

	return true;
}

module.exports = {
	isFileValid,
};
