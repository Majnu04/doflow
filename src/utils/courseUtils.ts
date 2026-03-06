export const isDsaCourse = (course: any): boolean => {
  if (!course) return false;

  const title = String(course.title || '').toLowerCase();
  const slug = String(course.slug || '').toLowerCase();
  const type = String(course.type || '').toLowerCase();
  const tags = Array.isArray(course.tags)
    ? course.tags.map((tag: any) => String(tag || '').toLowerCase())
    : [];

  return (
    title.includes('dsa') ||
    title.includes('data structure') ||
    slug.includes('dsa') ||
    slug.includes('data-structure') ||
    type === 'dsa' ||
    tags.some((tag) => tag.includes('dsa') || tag.includes('data structure')) ||
    Boolean(course.isDSA || course.isDsaCourse)
  );
};
