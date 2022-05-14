import {CachedMetadata} from "obsidian";

export class Range <T> {
    start: T;
    end: T;

    constructor(start: T, end: T) {
        this.start = start;
        this.end = end;
    }

    contains(value: T): boolean {
        return value >= this.start && value <= this.end;
    }
}

export interface IgnoreRangeConfig {
    doIgnoreInternalLinks?: boolean;
    doIgnoreCodeBlocks?: boolean;
}

export default class IgnoreRange extends Range<number> {
    constructor(start: number, end: number) {
        super(start, end);
    }

    static getIgnoreRangesFromCache(cache: CachedMetadata, config: IgnoreRangeConfig): IgnoreRange[] {
        const codeBlocks = config.doIgnoreCodeBlocks ? this.findCodeBlocks(cache) : [];
        const internalLinks = config.doIgnoreInternalLinks ? this.findInternalLinks(cache) : [];
        return [...codeBlocks, ...internalLinks];
    }

    private static findInternalLinks (cache: CachedMetadata) : IgnoreRange[] {
        return (cache.links ? cache.links : []).map(link => new IgnoreRange(link.position.start.offset, link.position.end.offset));
    }

    private static findCodeBlocks (cache: CachedMetadata) : IgnoreRange[] {
        return (cache.sections ? cache.sections : []).filter(section => section.type === "code")
            .map(section => new IgnoreRange(section.position.start.offset, section.position.end.offset))
    }
}