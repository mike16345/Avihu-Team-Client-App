export const ANGLE_LABELS = ["מלפנים", "מאחור", "מהצד ימין", "מהצד שמאל"];
export const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export type PhotoSlot = { label: string; url?: string };
export type PhotoCycle = { cycleNumber: number; uploadDate?: string; photos: PhotoSlot[] };

export const extractUploadDate = (fullUrl?: string): string | undefined => {
  if (!fullUrl) return undefined;
  for (const segment of fullUrl.split("/")) {
    const match = segment.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (match) return `${match[3]}/${match[2]}/${match[1]}`;
  }
  return undefined;
};

export const groupPhotos = (photos: string[]): PhotoCycle[] => {
  if (!photos?.length) return [];
  const groups: PhotoCycle[] = [];
  for (let index = 0; index < photos.length; index += 4) {
    const batch = photos.slice(index, index + 4);
    const cycleNumber = Math.floor(index / 4) + 1;
    const slots: PhotoSlot[] = ANGLE_LABELS.map((label, slotIndex) => ({
      label,
      url: batch[slotIndex],
    }));
    groups.push({
      cycleNumber,
      uploadDate: slots.map((slot) => extractUploadDate(slot.url)).find(Boolean),
      photos: slots,
    });
  }
  return groups.reverse();
};

export const isWithinLastWeek = (uploadDate?: string) => {
  if (!uploadDate) return false;
  const [day, month, year] = uploadDate.split("/");
  if (!day || !month || !year) return false;
  const uploadedAt = new Date(`${year}-${month}-${day}T00:00:00`).getTime();
  if (Number.isNaN(uploadedAt)) return false;
  return Date.now() - uploadedAt <= ONE_WEEK_MS;
};

export const findCurrentWeekCycle = (photos: string[]): PhotoCycle | undefined => {
  return groupPhotos(photos).find((group) => isWithinLastWeek(group.uploadDate));
};
