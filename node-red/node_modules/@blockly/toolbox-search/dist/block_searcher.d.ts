/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * A class that provides methods for indexing and searching blocks.
 */
export declare class BlockSearcher {
    private blockCreationWorkspace;
    private trigramsToBlocks;
    /**
     * Populates the cached map of trigrams to the blocks they correspond to.
     *
     * This method must be called before blockTypesMatching(). Behind the
     * scenes, it creates a workspace, loads the specified block types on it,
     * indexes their types and human-readable text, and cleans up after
     * itself.
     *
     * @param blockTypes A list of block types to index.
     */
    indexBlocks(blockTypes: string[]): void;
    /**
     * Check if the field is a dropdown, and index every text in the option
     *
     * @param field We need to check the type of field
     * @param blockType The block type to associate the trigrams with.
     */
    private indexDropdownOption;
    /**
     * Filters the available blocks based on the current query string.
     *
     * @param query The text to use to match blocks against.
     * @returns A list of block types matching the query.
     */
    blockTypesMatching(query: string): string[];
    /**
     * Generates trigrams for the given text and associates them with the given
     * block type.
     *
     * @param text The text to generate trigrams of.
     * @param blockType The block type to associate the trigrams with.
     */
    private indexBlockText;
    /**
     * Generates a list of trigrams for a given string.
     *
     * @param input The string to generate trigrams of.
     * @returns A list of trigrams of the given string.
     */
    private generateTrigrams;
    /**
     * Returns the intersection of two sets.
     *
     * @param a The first set.
     * @param b The second set.
     * @returns The intersection of the two sets.
     */
    private getIntersection;
}
//# sourceMappingURL=block_searcher.d.ts.map