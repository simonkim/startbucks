CREATE TABLE projects (
    id bigserial primary key,
    name text NOT NULL,
    url text NOT NULL,
    urlhash text NOT NULL,
    thumbnailUrl text NOT NULL,
    descr text NOT NULL,
    date_added timestamp default NULL,
    score integer not null,
    category varchar(40),
    userid integer
);

CREATE TABLE links (
    id bigserial primary key,
    name text NOT NULL,
    url text NOT NULL,
    urlhash text NOT NULL,
    thumbnailUrl text NOT NULL,
    descr text NOT NULL,
    date_added timestamp default NULL,
    score integer not null,
    category varchar(40),
    userid integer
);
