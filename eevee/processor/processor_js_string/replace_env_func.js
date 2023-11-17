module.exports = function replaceEnvDir(
  fileContent,
  filename
) {
  if (!fileContent) return fileContent;

  const configString = 'eevee_REPLACE_ENV__CONFIG';
  const commentPattern = '// ' + configString;
  const replaceComment = '// eevee_REPLACE_ENV__REPLACED ';
  const replacedCommentPattern = replaceComment + ' ' + configString;

  let env = process.env.NODE_ENV || process.env.ENV || 'production';
  if (env === 'product') {
    env = 'production';
  }
  if (env === 'test') {
    env = 'beta';
  }

  if (!fileContent.includes(commentPattern)) {
    return fileContent;
  }
  if (fileContent.includes(replaceComment)) {
    console.warn('eevee replace-env: Already replaced.');
    return fileContent;
  }

  return fileContent.split('\n').map((line) => {
    const pluginNameIndex = line.indexOf(commentPattern);
    if (pluginNameIndex > -1) {
      let envIndex = pluginNameIndex + commentPattern.length;
      let envString = '';
      while (line[envIndex] !== ' ' && envIndex < line.length - 1) {
        envIndex++; // `:` exists
        envString += line[envIndex];
      }
      if (envString === env) {
        // uncomment this line
        let newLine = line.slice(0, pluginNameIndex).trim();
        if (newLine.startsWith('//')) {
          newLine = newLine.slice(2);
        }
        return newLine + ' ' + replacedCommentPattern + ':' + envString;
      }
      // comment this line
      return replaceComment + ' ' + line;
    }
    return line;
  }).join('\n');

};