const loaderUtils = require('loader-utils')
const schemaUtils = require('schema-utils')
const babelParser = require('@babel/parser')
const { getErrorText } = require('./error')
const { validateComment } = require('./comment')

const schema = require('./schema.json')

const DEFAULT_OPTIONS = {
  notify: 'warning'
}

/**
 * @param {String} sourceCode
 * @returns {String} sourceCode
 */
module.exports = function (sourceCode) {
  // FIXME use this.getOptions(schema) in webpack 5
  const userOptions = loaderUtils.getOptions(this)
  const options = { ...DEFAULT_OPTIONS, ...userOptions }

  const errorHandler =
    options.notify === 'warning' ? this.emitWarning : this.emitError

  schemaUtils.validate(schema, options, {
    name: 'Deprecation Loader',
    baseDataPath: 'options'
  })

  const ast = babelParser.parse(sourceCode)

  for (const commentData of ast.comments) {
    const { value: comment } = commentData
    const isDeprecated = validateComment(comment)

    if (isDeprecated) {
      const errorText = getErrorText(commentData)
      errorHandler(new Error(errorText))
    }
  }

  return sourceCode
}