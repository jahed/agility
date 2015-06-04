set :css_dir, './stylesheets'
set :js_dir, './javascripts'
set :images_dir, './images'
set :relative_links, true

activate :automatic_image_sizes
activate :relative_assets

configure :development do
  activate :livereload
end

configure :build do
  activate :minify_css
  activate :minify_javascript
  # activate :asset_hash
end

after_build do
  `cp -R ./github/ ./build`
end

activate :deploy do |deploy|
  deploy.method = :git
  deploy.build_before = true
end