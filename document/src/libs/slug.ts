// 제목 텍스트 → URL 앵커(id) 변환. TOC 가 헤딩에 부여하는 id 와 검색 인덱스의 앵커가
// 같은 규칙을 공유해야 검색 결과 딥링크(#anchor)가 실제 헤딩으로 스크롤된다.
export function slugify(text: string): string {
    return text
        .trim()
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")   // 알파벳/숫자/공백/하이픈 외 제거
        .replace(/[\s_]+/g, "-")     // 공백·언더스코어 → 하이픈
        .replace(/-+/g, "-")          // 연속 하이픈 축약
        .replace(/^-|-$/g, "")        // 양끝 하이픈 제거
}
