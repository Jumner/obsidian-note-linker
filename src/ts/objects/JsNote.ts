import { MetadataCache, parseFrontMatterAliases, TFile, Vault } from "obsidian";
import IgnoreRange from "./IgnoreRange";
import { Note } from "../../../pkg";
import { getImpliedNodeFormatForFile } from "typescript";

export default class JsNote extends Note {
	constructor(
		title: string,
		path: string,
		content: string,
		aliases: string[] = [],
		ignore: IgnoreRange[] = []
	) {
		super(title, path, content, aliases, ignore);
	}

	static getNumberOfNotes(vault: Vault): number {
		return vault.getMarkdownFiles().filter(file => {
			return (!file.basename.endsWith(".excalidraw")); // Ignore excailidraw.md files
		}).length;
	}

	static async getNotesFromVault(
		vault: Vault,
		cache: MetadataCache
	): Promise<JsNote[]> {
		const notes = vault.getMarkdownFiles().filter(file => {
			return !file.basename.endsWith(".excalidraw"); // Ignore excailidraw.md files
		}).map(async (file, index) => {
			return await JsNote.fromFile(file, vault, cache);
		});
		return await Promise.all(notes);
	}

	static async fromFile(
		file: TFile,
		vault: Vault,
		cache: MetadataCache
	): Promise<JsNote> {
		const name = file.basename;
		const path = file.path;
		const content = await vault.cachedRead(file);
		const aliases =
			parseFrontMatterAliases(cache.getFileCache(file).frontmatter) ?? [];
		const ignoreRanges =
			IgnoreRange.getIgnoreRangesFromCache(
				content,
				cache.getFileCache(file),
				file.name
			) ?? [];
		let jsNote: JsNote = new JsNote(name, path, content, aliases, ignoreRanges);
		return jsNote;
	}
}
