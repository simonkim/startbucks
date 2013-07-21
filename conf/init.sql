CREATE TABLE projects (
    id bigserial primary key,
    name text NOT NULL,
    url text NOT NULL,
    thumbnailUrl text NOT NULL,
    descr text NOT NULL,
    author text NOT NULL,
    twitter text NOT NULL,
    facebook text NOT NULL,
    github text NOT NULL,
    date_added timestamp default NULL
);
