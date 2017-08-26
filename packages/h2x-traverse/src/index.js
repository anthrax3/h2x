/* eslint-disable no-restricted-syntax */
import { getVisitorKeys } from 'h2x-types'
import TraversalContext from './TraversalContext'

function traverse(ast, opts = {}, state = {}) {
  const keys = getVisitorKeys(ast)
  if (!keys) return

  const context = new TraversalContext({ opts, state })
  for (const key of keys) {
    if (context.visit(ast, key)) return
  }
}

export default traverse