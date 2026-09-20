import assert from 'node:assert/strict';
import {LITERARY_ACTIVITIES,activityAction,activityState,activitiesDone} from '../src/literary-activities.js';
export function solveActivities(t,id){
 for(const task of LITERARY_ACTIVITIES[id].slice(activityState(t,id).stage)){
  if(task.kind==='sequence')for(const key of task.solution)assert(activityAction(t,id,'pick',key));
  if(task.kind==='allocation')for(const key of task.required)assert(activityAction(t,id,'pick',key));
  if(task.kind==='pairs')for(const p of task.pairs)assert(activityAction(t,id,'pair',`${p[0]}=${p[2]}`));
  if(task.kind==='witnesses')for(const p of task.items)assert(activityAction(t,id,'visit',p[0]));
  if(task.kind==='route')for(const pos of [1,5,9,10,11,15])assert(activityAction(t,id,'move',pos));
  assert(activityAction(t,id,'submit'));
 }
 assert(activitiesDone(t,id));
}
export async function solveActivitiesUI(page,id){
 for(const task of LITERARY_ACTIVITIES[id]){
  if(task.kind==='sequence')for(const key of task.solution)await page.locator(`[data-activity-pick="${key}"]`).click();
  if(task.kind==='allocation')for(const key of task.required)await page.locator(`[data-activity-pick="${key}"]`).click();
  if(task.kind==='pairs')for(const p of task.pairs){await page.locator(`[data-pair-left="${p[0]}"]`).click();await page.locator(`[data-pair-right="${p[2]}"]`).click();}
  if(task.kind==='witnesses')for(const p of task.items)await page.locator(`[data-activity-visit="${p[0]}"]`).click();
  if(task.kind==='route')for(const pos of [1,5,9,10,11,15])await page.locator(`[data-activity-move="${pos}"]`).click();
  await page.locator('[data-activity-submit]').click();
 }
}
