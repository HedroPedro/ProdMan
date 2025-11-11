# RUBY IMAGE
FROM ruby:3.4.7-slim

# VARIABLES
ENV LANG C.UTF-8
ENV RAILS_ENV=development
WORKDIR /app

# DEPENDECIES
RUN apt-get update -qq && \
    apt-get install -y build-essential libmariadb-dev nodejs libyaml-dev mariadb-client

# INSTALL GEMS
COPY Gemfile Gemfile.lock ./
RUN bundle install --jobs 20 --retry 5

# ENTRYPOINT
COPY entrypoint.sh /usr/bin/
RUN chmod +x /usr/bin/entrypoint.sh
ENTRYPOINT ["entrypoint.sh"]

# INTERNAL PORT
EXPOSE 3000

CMD ["rails", "server", "-b", "0.0.0.0"]