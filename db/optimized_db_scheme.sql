CREATE TABLE user(
    id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
    first_name VARCHAR(20) NOT NULL,
    last_name VARCHAR(20) NOT NULL,
    email VARCHAR(50) UNIQUE NOT NULL,
    jwt VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE exam(
    id SMALLINT NOT NULL,
    user_id INT NOT NULL,
    exam_code INT(6) UNIQUE NOT NULL,
    title VARCHAR(30) NOT NULL,
    duration_min INT,
    start_time TIME,
    end_time TIME,
    scheduled_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(id, user_id),
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

CREATE TABLE question(
    id SMALLINT NOT NULL,
    exam_id SMALLINT NOT NULL,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    question_type ENUM("single-choice", "multi-choice", "text") NOT NULL,
    marks SMALLINT,
    PRIMARY KEY(id, exam_id, user_id),
    FOREIGN KEY (exam_id, user_id) REFERENCES exam(id, user_id) ON DELETE CASCADE
);

CREATE TABLE opts(
    id SMALLINT NOT NULL,
    question_id SMALLINT NOT NULL,
    exam_id SMALLINT NOT NULL,
    user_id INT NOT NULL,
    option_text VARCHAR(255) NOT NULL,
    is_correct BOOL NOT NULL DEFAULT FALSE,
    PRIMARY KEY(id, question_id, exam_id, user_id),
    FOREIGN KEY (question_id, exam_id, user_id) REFERENCES question(id, exam_id, user_id) ON DELETE CASCADE
);

CREATE TABLE exam_attempt(
    id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
    user_id INT NOT NULL,
    exam_id SMALLINT NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    awarded_marks SMALLINT,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (exam_id, user_id) REFERENCES exam(id, user_id) ON DELETE CASCADE
);

CREATE TABLE answer(
    id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
    exam_attempt_id INT NOT NULL,
    question_id SMALLINT NOT NULL,
    exam_id SMALLINT NOT NULL,
    user_id INT NOT NULL,
    awarded_marks SMALLINT,
    FOREIGN KEY (exam_attempt_id) REFERENCES exam_attempt(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id, exam_id, user_id) REFERENCES question(id, exam_id, user_id) ON DELETE CASCADE
);

CREATE TABLE text_answer(
    id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
    answer_id INT NOT NULL,
    answer_text LONGTEXT,
    FOREIGN KEY (answer_id) REFERENCES answer(id) ON DELETE CASCADE
);

CREATE TABLE mcq_answer(
    id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
    option_id SMALLINT NOT NULL,
    question_id SMALLINT NOT NULL,
    exam_id SMALLINT NOT NULL,
    user_id INT NOT NULL,
    answer_id INT NOT NULL,
    FOREIGN KEY (option_id, question_id, exam_id, user_id) REFERENCES opts(id, question_id, exam_id, user_id) ON DELETE CASCADE,
    FOREIGN KEY (answer_id) REFERENCES answer(id) ON DELETE CASCADE
);
