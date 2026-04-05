import { test, expect, Page } from '@playwright/test';

const isMobileViewport = (width: number | undefined): boolean => {
  return Boolean(width && width <= 900);
};

const openMenuIfMobile = async (page: Page) => {
  const width = page.viewportSize()?.width;
  if (!isMobileViewport(width)) {
    return;
  }

  await page.getByRole('button', { name: '메뉴 열기' }).click();
  await expect(page.locator('.layout-sidebar.left.open')).toBeVisible();
};

const openScheduleIfMobile = async (page: Page) => {
  const width = page.viewportSize()?.width;
  if (!isMobileViewport(width)) {
    return;
  }

  await page.getByRole('button', { name: '일정 패널 열기' }).click();
  await expect(page.locator('.layout-sidebar.right.open')).toBeVisible();
};

test.describe('Calendar App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('shows auth screen first', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Web Calendar' })).toBeVisible();
    await expect(page.getByRole('button', { name: '로그인', exact: true }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: '회원가입', exact: true })).toBeVisible();
  });

  test('register/login/logout flow works', async ({ page }) => {
    await page.getByRole('button', { name: '회원가입' }).click();
    await page.getByLabel('이름').fill('Playwright User');
    await page.getByLabel('이메일').fill('pw-user@example.com');
    await page.getByLabel('비밀번호', { exact: true }).fill('calendar-pass-123');
    await page.getByLabel('비밀번호 확인').fill('calendar-pass-123');
    await page.getByTestId('auth-submit').click();

    await expect(page.locator('.calendar-grid')).toBeVisible();

    const width = page.viewportSize()?.width;
    if (isMobileViewport(width)) {
      await openMenuIfMobile(page);
    }

    await expect(page.getByRole('button', { name: '로그아웃' })).toBeVisible();

    await page.getByRole('button', { name: '로그아웃' }).click();
    await expect(page.getByRole('heading', { name: 'Web Calendar' })).toBeVisible();

    await page.getByLabel('이메일').fill('pw-user@example.com');
    await page.getByLabel('비밀번호', { exact: true }).fill('calendar-pass-123');
    await page.getByTestId('auth-submit').click();

    await expect(page.locator('.calendar-grid')).toBeVisible();
  });

  test('creates, edits, and deletes an event', async ({ page }) => {
    await page.getByRole('button', { name: '회원가입' }).click();
    await page.getByLabel('이름').fill('Event User');
    await page.getByLabel('이메일').fill('event-user@example.com');
    await page.getByLabel('비밀번호', { exact: true }).fill('calendar-pass-123');
    await page.getByLabel('비밀번호 확인').fill('calendar-pass-123');
    await page.getByTestId('auth-submit').click();

    await expect(page.locator('.calendar-grid')).toBeVisible();

    await openScheduleIfMobile(page);
    await page.getByRole('button', { name: '일정 추가' }).click();
    await page.getByLabel('제목').fill('팀 스탠드업');
    await page.getByLabel('세부 내용').fill('매일 아침 체크인');
    await page.getByRole('button', { name: '일정 등록하기' }).click();

    await expect(page.getByRole('button', { name: /일정 수정 팀 스탠드업/ })).toBeVisible();

    await page.getByRole('button', { name: /일정 수정 팀 스탠드업/ }).click();
    await page.getByLabel('제목').fill('팀 스탠드업 수정');
    await page.getByRole('button', { name: '수정 저장' }).click();

    await expect(page.getByRole('button', { name: /일정 수정 팀 스탠드업 수정/ })).toBeVisible();

    await page.getByRole('button', { name: /일정 삭제 팀 스탠드업 수정/ }).click();
    await expect(page.getByRole('button', { name: /일정 수정 팀 스탠드업 수정/ })).toHaveCount(0);
  });
});
