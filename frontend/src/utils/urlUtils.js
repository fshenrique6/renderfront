export const nameToSlug = (name) => {
    if (!name) return '';
    
    return name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  };
  
  export const slugToDisplayName = (slug) => {
    if (!slug) return '';
    
    return slug
      .replace(/\-/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };
  
  export const findBoardBySlug = (boards, slug) => {
    if (!boards || !slug) return null;
    
    return boards.find(board => nameToSlug(board.name) === slug);
  };
  
  export const generateUniqueSlug = (boards, baseName, excludeId = null) => {
    const baseSlug = nameToSlug(baseName);
    let slug = baseSlug;
    let counter = 1;
    
    while (boards.some(board => 
      board.id !== excludeId && nameToSlug(board.name) === slug
    )) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    return slug;
  }; 