export function sortByExtension(extensions: string[]) {
  return (a: string, b: string) => {
    const extA = a.split('.').pop() as string;
    const extB = b.split('.').pop() as string;
    return extensions.indexOf(extA) - extensions.indexOf(extB);
  };
}
