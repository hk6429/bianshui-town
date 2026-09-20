import {LITERARY_QUESTS} from '../src/literary-quests.js';
import {evidenceLines} from '../src/learning.js';
export async function answerReadingUI(page,id,step,answer=LITERARY_QUESTS[id].steps[step].answer){
 await page.locator(`[data-learning-field=answer][value="${answer}"]`).check();await page.locator('[data-learning-field=evidence]').selectOption(String(evidenceLines(id).findIndex(x=>x.step===step)));await page.locator('[data-learning-field=reason]').fill('我根據這段文字的線索，連結自己的選擇與理由。');await page.locator('[data-learning=answer]').click();
}
