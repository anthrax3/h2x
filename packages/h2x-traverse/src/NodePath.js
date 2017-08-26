/* eslint-disable no-restricted-syntax, no-continue, no-underscore-dangle */
import debug from 'debug'
import traverse from './'
import { getNodeType } from 'h2x-types'

const h2xDebug = debug('h2x')

class NodePath {
  static get({ parent, container, listKey, key, context }) {
    const node = container[key]
    return new NodePath({
      listKey,
      key,
      parent,
      container,
      node,
      context,
    })
  }

  constructor({ container, parent, key, listKey, node, context }) {
    this.container = container
    this.parent = parent
    this.listKey = listKey
    this.key = key
    this.node = node
    this.context = context
    this.state = context.state
    this.opts = context.opts
    this.type = getNodeType(node)
    this.shouldStop = false
  }

  debug(value) {
    h2xDebug(value)
  }

  visit() {
    if (this.call('enter')) this.shouldStop = true

    traverse(this.node, this.opts, this.state)

    if (this.call('exit')) this.shouldStop = true

    return this.shouldStop
  }

  call(key) {
    const opts = this.opts

    this.debug(key)

    if (this.node) {
      if (this._call(opts[key])) return true
    }

    if (this.node) {
      return this._call(opts[this.type] && opts[this.type][key])
    }

    return false
  }

  replace(node) {
    this.shouldStop = true
    this.node = node
    this.container[this.key] = node
    this.context.visit(this.container, this.key)
  }

  _call(fns) {
    if (!fns) return false
    if (!Array.isArray(fns)) fns = [fns]

    for (const fn of fns) {
      if (!fn) continue

      const node = this.node
      if (!node) return true

      const ret = fn(this, this.state)
      if (ret)
        throw new Error(`Unexpected return value from visitor method ${fn}`)

      // node has been replaced, it will have been requeued
      if (this.node !== node) return true
    }

    return false
  }
}

export default NodePath