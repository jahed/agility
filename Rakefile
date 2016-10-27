task default: %w[test]

task :test do
  puts "\nBuilding project"
  try "middleman build"
end

task :deploy do
  puts "\nDeploying to GitHub Pages"
  try "middleman deploy"
end

namespace :travis do
  task :script do
    Rake::Task["test"].invoke
  end

  task :after_success do
    try "./travis-deploy.sh"
  end
end

def try(command)
  system command
  if $? != 0 then
    raise "Command: `#{command}` exited with code #{$?.exitstatus}"
  end
end
