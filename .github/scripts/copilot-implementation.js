module.exports = async ({github, context, core}) => {
  // Enable Copilot features
  await github.rest.repos.update({
    ...context.repo,
    allow_auto_merge: true,
    allow_merge_commit: true,
    allow_rebase_merge: true,
    delete_branch_on_merge: true
  });

  // Configure branch protection
  await github.rest.repos.updateBranchProtection({
    ...context.repo,
    branch: 'main',
    required_status_checks: {
      strict: true,
      contexts: ['build', 'test']
    },
    enforce_admins: true,
    required_pull_request_reviews: {
      required_approving_review_count: 1,
      dismiss_stale_reviews: true,
      require_code_owner_reviews: true
    },
    restrictions: null
  });

  // Add Copilot as collaborator
  try {
    await github.rest.repos.addCollaborator({
      ...context.repo,
      username: 'github-copilot[bot]',
      permission: 'write'
    });
  } catch (error) {
    core.warning('Could not add Copilot bot as collaborator');
  }
};
