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
    try "openssl aes-256-cbc -K ${encrypted_cda326ff967d_key} -iv ${encrypted_cda326ff967d_iv} -in deploy_key.enc -out deploy_key -d"
    try "chmod 600 deploy_key"
    try "eval `ssh-agent -s` && ssh-add deploy_key"
    try "git remote set-url origin \"git@github.com:jahed/agility.git\""
 
    try "git config user.name ${GH_USER}"
    try "git config user.email ${GH_EMAIL}"
    Rake::Task["deploy"].invoke
  end
end

def try(command)
  system command
  if $? != 0 then
    raise "Command: `#{command}` exited with code #{$?.exitstatus}"
  end
end
