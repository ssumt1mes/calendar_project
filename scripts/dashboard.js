import inquirer from 'inquirer';
import chalk from 'chalk';
import boxen from 'boxen';
import open from 'open';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Configuration
const VERCEL_URL = 'https://web-calendar-eight.vercel.app';
const REPO_URL = 'https://github.com/ssumt1mes/calendar_project/actions';
const PWD = process.cwd();

// Helper: Clear Screen
const clear = () => process.stdout.write('\x1Bc');

// Helper: Get Vercel Status (Simulated for speed, or via CLI if needed)
const getVercelStatus = async () => {
    try {
        // Simple check if online (optimistic)
        const response = await fetch(VERCEL_URL);
        return response.ok ? chalk.green('Online (200 OK)') : chalk.red(`Offline (${response.status})`);
    } catch (e) {
        return chalk.red('Unreachable');
    }
};

// Helper: Check Last Test Run
const getTestStatus = () => {
    const reportPath = path.join(PWD, 'playwright-report', 'index.html');
    if (fs.existsSync(reportPath)) {
        const stats = fs.statSync(reportPath);
        const timeAgo = Math.round((Date.now() - stats.mtimeMs) / 60000);
        return chalk.blue(`Report available (${timeAgo} mins ago)`);
    }
    return chalk.gray('No report found');
};

async function main() {
    clear();
    console.log(boxen(chalk.bold.cyan(' 🚀 Web Calendar Command Center '), { padding: 1, borderStyle: 'round', borderColor: 'cyan' }));

    const vStatus = await getVercelStatus();
    const tStatus = getTestStatus();

    console.log(`\n${chalk.bold('📡 Deployment Status')}`);
    console.log(`   ${chalk.gray('URL:')} ${chalk.underline(VERCEL_URL)}`);
    console.log(`   ${chalk.gray('Status:')} ${vStatus}`);

    console.log(`\n${chalk.bold('🧪 Test Intelligence')}`);
    console.log(`   ${chalk.gray('Local Report:')} ${tStatus}`);
    
    console.log('\n' + chalk.gray('────────────────────────────────────────') + '\n');

    const { action } = await inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'What would you like to do?',
            choices: [
                { name: '🌐 Open Production App', value: 'open_prod' },
                { name: '📊 View Local Test Report', value: 'open_report' },
                { name: '🐙 View GitHub Actions (CI)', value: 'open_ci' },
                { name: '▶️  Run E2E Tests (Headless)', value: 'run_test' },
                new inquirer.Separator(),
                { name: '🚪 Exit', value: 'exit' }
            ]
        }
    ]);

    switch (action) {
        case 'open_prod':
            console.log(chalk.gray('Opening production site...'));
            await open(VERCEL_URL);
            break;
        case 'open_report':
            const reportPath = path.join(PWD, 'playwright-report', 'index.html');
            if (fs.existsSync(reportPath)) {
                console.log(chalk.gray('Opening Playwright report...'));
                await open(reportPath);
            } else {
                console.log(chalk.red('❌ No report found. Run tests first.'));
            }
            break;
        case 'open_ci':
            console.log(chalk.gray('Opening GitHub Actions...'));
            await open(REPO_URL);
            break;
        case 'run_test':
            console.log(chalk.yellow('\nRunning E2E tests... (This may take a moment)\n'));
            try {
                execSync('npm run test:e2e', { stdio: 'inherit' });
                console.log(chalk.green('\n✅ Tests Completed!'));
            } catch (e) {
                console.log(chalk.red('\n❌ Tests Failed. Check report.'));
            }
            break;
        case 'exit':
            console.log(chalk.cyan('Bye! 👋'));
            process.exit(0);
    }
    
    // Loop back for persistent dashboard unless exit
    if (action !== 'exit') {
        setTimeout(main, 2000);
    }
}

main().catch(console.error);
