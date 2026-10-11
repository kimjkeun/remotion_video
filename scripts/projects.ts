// TTS·자막을 만들 대본과 내레이터 스타일을 고릅니다.
//   --project=longform|shorts|test|sky-long|sky-short (기본 longform)
//   --style=1~3 (기본 1, 목록은 src/narrators.ts)
// 음성 폴더: public/audio/<프로젝트> (스타일 1) 또는 public/audio/<프로젝트>-s<번호>
import { CHAPTERS as LONGFORM } from "../src/longform/script";
import { CHAPTERS as SHORTS } from "../src/shorts2/script";
import type { Chapter } from "../src/longform/script";
import { LONG as SKY_LONG, SHORT as SKY_SHORT } from "../src/sky/script";
import { audioDirName, STYLES } from "../src/narrators";

// test: 스타일 비교용 짧은 3문장 (쇼츠 첫 장과 같은 문장이라 스타일 1과 바로 비교 가능)
const TEST: Chapter[] = [{ id: "t1", title: "스타일 테스트", lines: SHORTS[0].lines.slice(0, 3) }];

const PROJECTS: Record<string, Chapter[]> = {
  longform: LONGFORM,
  shorts: SHORTS,
  test: TEST,
  // 하늘 편
  "sky-long": SKY_LONG,
  "sky-short": SKY_SHORT,
};

const argValue = (args: string[], name: string) =>
  args.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);

export const pickProject = (args: string[]) => {
  const project = argValue(args, "project") ?? "longform";
  const chapters = PROJECTS[project];
  if (!chapters) {
    throw new Error(`없는 프로젝트: ${project} (사용 가능: ${Object.keys(PROJECTS).join(", ")})`);
  }
  const style = Number(argValue(args, "style") ?? 1);
  const narrator = STYLES[style];
  if (!narrator) {
    throw new Error(`없는 스타일: ${style} (사용 가능: ${Object.keys(STYLES).join(", ")})`);
  }
  // name 은 음성 폴더 이름으로 쓰입니다.
  return { name: audioDirName(project, style), chapters, narrator };
};
