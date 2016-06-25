task default: %w[test]

task :test do
  puts "\nBuilding project"
  try "middleman build"
end

task :deploy do
  puts "\nCopying GitHub-specific files"
  try "cp -rv ./github/* ./build/"

  puts "\nDeploying to GitHub Pages"
  try "middleman deploy"
end

namespace :travis do
  task :script do
    Rake::Task["test"].invoke
  end

  task :after_success do
    puts "\nRunning Travis Deployment"
    
    puts "\nSetting up Git access"
    try "echo ${GH_KEY} > ~/.ssh/deploy_key"
    try "echo -e 'Host github.com\n  IdentityFile ~/.ssh/deploy_key' > ~/.ssh/config"

    try "git config --global user.name ${GH_USER}"
    try "git config --global user.email ${GH_EMAIL}"
    Rake::Task["deploy"].invoke
  end
end

def try(command)
  system command
  if $? != 0 then
    raise "Command: `#{command}` exited with code #{$?.exitstatus}"
  end
end
