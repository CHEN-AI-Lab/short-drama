/// <reference path="node_modules/@tarojs/plugin-platform-weapp/types/shims.d.ts" />

declare module '*.png'
declare module '*.gif'
declare module '*.jpg'
declare module '*.jpeg'
declare module '*.svg'
declare module '*.css'
declare module '*.less'
declare module '*.scss'
declare module '*.sass'
declare module '*.styl'

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any
  }
}