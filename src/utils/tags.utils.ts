import type { Tag } from "@/repositories/posts/posts.repository.interface";

export const parseTags = (tags: Tag[] | undefined | null): string[] => {
    return (tags ?? []).map((t) => t.tag);
}

export const serializeTags = (tags: string[] | undefined): Tag[] => {
    return (tags ?? []).map((tag) => ({ tag }));
}