/* eslint-disable no-underscore-dangle */
declare module 'trie-search' {
    type KeyFields = string | string[] | KeyFields[]
  
    type TrieNode<T> = {
      value?: T[]
      [key: string]: TrieNode<T> | T[] | undefined
    }
  
    type TrieSearchOptions<T> = {
      ignoreCase?: boolean
      maxCacheSize?: number
      cache?: boolean
      splitOnRegEx?: RegExp
      splitOnGetRegEx?: RegExp
      min?: number
      keepAll?: boolean
      keepAllKey?: string
      idFieldOrFunction?: string | ((item: T) => string)
      expandRegexes?: { regex: RegExp; alternate: string }[]
      insertFullUnsplitKey?: boolean
    }
  
    type Reducer<A, T, I = T> = (
      accumulator: A | undefined,
      phrase: string,
      matches: T[],
      trieSearch: TrieSearch<T, I>
    ) => A | undefined
  
    export default class TrieSearch<T, I = T> {
      constructor(keyFields?: KeyFields, options?: TrieSearchOptions<I>)
  
      size: number
  
      root: TrieNode<T>
  
      add(obj: T, customKeys?: KeyFields | number): void
  
      expandString(value: string): string[]
  
      addAll(arr: T[], customKeys?: KeyFields | number): void
  
      reset(): void
  
      clearCache(): void
  
      cleanCache(): void
  
      addFromObject(obj: T, valueField: string): void
  
      map(key: string, value: T): void
  
      keyToArr(key: string): string[]
  
      findNode(key: string): TrieNode<T> | undefined
  
      _getCacheKey(phrase: string, limit?: number): string
  
      _get(phrase: string, limit?: number): T[]
  
      get(
        phrases: string | string[],
        reducer?: null | undefined,
        limit?: number
      ): T[]
  
      get<A>(
        phrases: string | string[],
        reducer?: Reducer<A, T, I>,
        limit?: number
      ): A | undefined
  
      search(phrases: string | string[], reducer?: null | undefined): T[]
  
      search<A>(
        phrases: string | string[],
        reducer: Reducer<A, T, I>
      ): A | undefined
  
      getId(item: I): string
  
      static UNION_REDUCER: <V>(
        accumulator: V[] | undefined,
        phrase: string,
        matches: V[],
        trieSearch: TrieSearch<V, V>
      ) => V[]
    }
  }