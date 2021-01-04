const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const AirtablePlus = require('airtable-plus');
const DotEnv = require('dotenv').config();
const humanizeDuration = require("humanize-duration");
const tests = require('./tests');

// baseID, apiKey, and tableName can alternatively be set by environment variables
const testsTable = new AirtablePlus({ tableName: "Tests" }),
    studentsTable = new AirtablePlus({ tableName: "Students" }),
    schoolsTable = new AirtablePlus({ tableName: "Schools" }),
    competitionsTable = new AirtablePlus({ tableName: "Competitions" });

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send("Welcome to the home page!");
});

app.get('/test/**', async (req, res) => {
    const recordId = req.url.split("/")[2];

    try {
        let record = await testsTable.find(recordId);
        let beginButtonText = "Begin Test";
        if (record.fields["Start Time"] || record.fields["Submission Time"]) {
            beginButtonText = "Resume Test"
        }

        let studentsPromise = record.fields.Students.map(studentId => studentsTable.find(studentId)),
            schoolPromise = schoolsTable.find(record.fields.School[0]),
            competitionPromise = competitionsTable.find(record.fields.Competition[0]);

        let [competition, school, ...students] = await Promise.all([competitionPromise, schoolPromise, ...studentsPromise]);

        let questions = await tests.getOrderedQuestions(record, competition.fields.Code);
        let available = tests.validateTime(competition);

        // res.status(200).send(`${students.map(s => s.fields.Name).join(", ")} — ${school.fields.Name} <br> ${competition.fields.Name} <br> ${JSON.stringify(record, null, 2)}`);
        res.render('pages/tests', {
            name: students.map(s => s.fields.Name).join(", "),
            competition: competition.fields["Friendly Name"],
            division: competition.fields.Division,
            durationText: humanizeDuration(competition.fields["Max Duration"] * 1000),
            duration: competition.fields["Max Duration"] * 1000,
            competitionId: competition.id,
            competitionCode: competition.fields.Code,
            recordId,
            beginButtonText,
            numberOfQuestions: questions.length,
            currentQuestion: record.fields["Current Question Index"],
            available
        })
    } catch (e) {
        console.log(e);
        res.status(500).send("Invalid link. Contact Us.");
    }
});

app.post('/test/endpoint/**', async (req, res) => {
    const recordId = req.url.split("/")[3];

    let record = await testsTable.find(recordId),
        competition = await competitionsTable.find(record.fields.Competition[0]);
    const questionsPromise = tests.getOrderedQuestions(record, req.body.competitionCode);
    
    if (tests.validateTime(competition) !== "true") {
        res.send("TIMEOUT");
        return;
    } 

    if (req.body.action == "begin") {
        try {
            let questions = await questionsPromise;

            if (record.fields["Start Time"] || record.fields["Submission Time"]) {
                let numberQuestionsCompleted = record.fields["Current Question Index"];
                if (numberQuestionsCompleted === questions.length) {
                    res.send("FINISHED");
                } else {
                    res.status(200).send(questions[numberQuestionsCompleted]);
                }
                return;
            }

            const startTimePromise = testsTable.update(recordId, { "Start Time": Date.now() });
            const currentQuestionIndexPromise = testsTable.update(recordId, { "Current Question Index": 0 });

            let [other] = await Promise.all([startTimePromise, currentQuestionIndexPromise]);
            res.status(200).json(questions[0]);
        } catch (e) {
            console.log(e);
            res.status(500).send(e);
        }

    } else if (req.body.action == "nextQuestion") {
        let questions = await questionsPromise;
        let numberQuestionsCompleted = record.fields["Current Question Index"];

        let newNumberOfQuestionsCompleted = parseInt(record.fields["Current Question Index"]) + 1;
        testsTable.update(recordId, { "Current Question Index": newNumberOfQuestionsCompleted });

        let answeredQuestion = questions.find(q => q.index == numberQuestionsCompleted);
        testsTable.update(recordId, { [answeredQuestion.questionCode]: req.body.answer });

        if (newNumberOfQuestionsCompleted === questions.length) {
            const time = await airtable.update(id, { "Submission Time": Date.now() });
            res.send("FINISHED");
        } else {
            res.send(questions[newNumberOfQuestionsCompleted]);
        }
    } else {
        res.status(400).send("Unkown Request");
    }
});

app.get('/done**', (req, res) => {
    res.send("Congrats!");
});

const server = app.listen(8080, () => {
    const host = server.address().address;
    const port = server.address().port;

    console.log(`App listening at http://${host}:${port}`);
});
