// USTEM Academy LMS — seed data and storage layer
// Все данные сохраняются в localStorage. Первый запуск инициализирует базу.

const STORAGE_KEY = 'ustem_lms_v10';

// Multi-lang helper alias — `{ru, kk, en}` объекты для текстовых полей
const ml = (ru, kk, en) => ({ ru, kk, en });

const seedData = {
  users: [
    {
      id: 'u_admin',
      name: 'Администратор USTEM',
      email: 'admin@ustem.kz',
      password: 'admin123',
      role: 'admin',
      avatar: 'А',
      enrolled: [],
      progress: {},
      quizScores: {},
      createdAt: '2026-01-15T10:00:00Z',
    },
    {
      id: 'u_demo',
      name: 'Айбек Студент',
      email: 'student@ustem.kz',
      password: 'student123',
      role: 'student',
      avatar: 'А',
      enrolled: ['c_fll', 'c_arduino'],
      progress: {
        c_fll: ['l_fll_1', 'l_fll_2'],
        c_arduino: ['l_ard_1'],
      },
      quizScores: {
        l_fll_2: { score: 2, total: 3, completed: true },
      },
      createdAt: '2026-02-01T09:00:00Z',
    },
  ],

  courses: [
    // -------------------- FIRST LEGO League --------------------
    {
      id: 'c_fll',
      slug: 'first-lego-league',
      categoryKey: 'cat.competitions',
      levelKey: 'level.beginner',
      durationWeeks: 8,
      hours: 32,
      students: 1842,
      rating: 4.9,
      featured: true,
      cover: 'fll',
      title: ml(
        'FIRST LEGO League: подготовка к соревнованиям',
        'FIRST LEGO League: жарыстарға дайындық',
        'FIRST LEGO League: Competition Prep'
      ),
      tagline: ml(
        'Соберите и запрограммируйте робота-чемпиона на LEGO SPIKE Prime',
        'LEGO SPIKE Prime-да чемпион-роботты құрастырып, бағдарламалаңыз',
        'Build and program a champion robot using LEGO SPIKE Prime'
      ),
      description: ml(
        'Полный курс подготовки команд к FIRST LEGO League — крупнейшим в мире соревнованиям по робототехнике для школьников 9-16 лет. Изучите конструирование на SPIKE Prime, программирование на Scratch/Python, командную работу и стратегию выполнения миссий сезона. Курс ведут менторы команд, дошедших до мирового финала.',
        'FIRST LEGO League — 9-16 жастағы мектеп оқушыларына арналған әлемдегі ең үлкен робототехника жарысы. SPIKE Prime-да құрастыруды, Scratch/Python-да бағдарламалауды, команда болып жұмыс істеуді және маусым миссияларының стратегиясын үйренесіз. Курсты әлем финалына жеткен командалардың тәлімгерлері жүргізеді.',
        'A complete training course for teams preparing for FIRST LEGO League — the worlds largest robotics competition for students aged 9-16. Learn SPIKE Prime construction, Scratch/Python programming, teamwork, and season mission strategy. Taught by mentors of teams that reached the world finals.'
      ),
      objectives: [
        ml('Собирать конкурентоспособного робота на SPIKE Prime',
           'SPIKE Prime-да бәсекеге қабілетті роботты құрастыру',
           'Build a competitive robot using SPIKE Prime'),
        ml('Программировать в Scratch и переходить на Python',
           'Scratch-та бағдарламалап, Python-ға көшу',
           'Program in Scratch and transition to Python'),
        ml('Применять стратегию для миссий сезона',
           'Маусым миссияларына стратегия қолдану',
           'Apply strategy for season missions'),
        ml('Работать в команде и презентовать проект жюри',
           'Командада жұмыс істеп, жобаны қазылар алқасына таныстыру',
           'Work in a team and present project to judges'),
        ml('Готовиться к Core Values интервью',
           'Core Values сұхбатына дайындалу',
           'Prepare for Core Values interviews'),
      ],
      instructor: {
        name: 'Алибек Ахметов',
        avatar: 'А',
        role: ml('Head Coach, FLL Kazakhstan', 'Бас бапкер, FLL Қазақстан', 'Head Coach, FLL Kazakhstan'),
        bio: ml(
          'Тренер команды, занявшей 2 место на FLL World Festival 2024. 8 лет опыта в подготовке школьников.',
          '2024 жылы FLL World Festival-да 2-орын алған команданың бапкері. Мектеп оқушыларын дайындауда 8 жылдық тәжірибесі бар.',
          'Coach of the team that took 2nd place at FLL World Festival 2024. 8 years of experience training school students.'
        ),
      },
      lessons: [
        {
          id: 'l_fll_1',
          duration: 30,
          type: 'video',
          title: ml('Знакомство с FIRST LEGO League', 'FIRST LEGO League-мен танысу', 'Introduction to FIRST LEGO League'),
          content: `<h2>Что такое FIRST LEGO League</h2>
<p>FLL — это международная программа соревнований по робототехнике для школьников от 9 до 16 лет, проводимая в более чем 110 странах мира.</p>
<h3>Структура сезона</h3>
<ul>
  <li><strong>Robot Game</strong> — миссии на игровом поле 2.4 × 1.2 м</li>
  <li><strong>Innovation Project</strong> — научный проект по теме сезона</li>
  <li><strong>Core Values</strong> — командные ценности</li>
  <li><strong>Robot Design</strong> — конструкция и программирование</li>
</ul>
<div class="callout"><span>🏆</span><div>Казахстан стабильно входит в топ-30 стран на FLL World Festival.</div></div>`,
        },
        {
          id: 'l_fll_2',
          duration: 40,
          type: 'video',
          title: ml('Конструктор SPIKE Prime', 'SPIKE Prime конструкторы', 'SPIKE Prime kit overview'),
          content: `<h2>Изучаем набор SPIKE Prime</h2>
<p>SPIKE Prime — современный набор LEGO Education с программируемым хабом, моторами и датчиками.</p>
<ul>
  <li>Хаб с 6 портами</li>
  <li>2 больших и 1 средний мотор</li>
  <li>Датчики: цвета, расстояния, силы</li>
  <li>500+ элементов LEGO Technic</li>
</ul>`,
          quiz: {
            questions: [
              {
                q: ml('Сколько портов у хаба SPIKE Prime?', 'SPIKE Prime хабында неше порт бар?', 'How many ports does the SPIKE Prime hub have?'),
                options: [ml('4','4','4'), ml('6','6','6'), ml('8','8','8'), ml('10','10','10')],
                correct: 1,
              },
              {
                q: ml('Какой возраст для участия в FLL Challenge?', 'FLL Challenge-ке қатысу үшін қандай жас?', 'What age range can compete in FLL Challenge?'),
                options: [ml('6-9','6-9','6-9'), ml('9-16','9-16','9-16'), ml('14-18','14-18','14-18'), ml('Любой','Кез келген','Any')],
                correct: 1,
              },
              {
                q: ml('Что такое Innovation Project?', 'Innovation Project дегеніміз не?', 'What is the Innovation Project?'),
                options: [
                  ml('Дизайн робота','Робот дизайны','Robot design'),
                  ml('Научный проект','Ғылыми жоба','Research project'),
                  ml('Командная игра','Командалық ойын','Team game'),
                  ml('Программирование','Бағдарламалау','Programming'),
                ],
                correct: 1,
              },
            ],
          },
        },
        {
          id: 'l_fll_3',
          duration: 45,
          type: 'video',
          title: ml('Программирование в SPIKE App', 'SPIKE App-та бағдарламалау', 'Programming in SPIKE App'),
          content: `<h2>Блочное программирование SPIKE</h2>
<p>SPIKE App использует визуальный язык на основе Scratch, что делает его доступным даже для тех, кто никогда не программировал. Программа собирается из разноцветных блоков, которые группируются по категориям.</p>
<h3>Основные категории блоков</h3>
<ul>
  <li><strong>Движение</strong> — управление моторами: вперёд/назад, поворот на градусы, скорость</li>
  <li><strong>Датчики</strong> — чтение значений с цвета, расстояния, силы, гироскопа</li>
  <li><strong>Свет</strong> — управление матрицей 5×5 на хабе</li>
  <li><strong>События</strong> — реакция на нажатие кнопок, звук</li>
  <li><strong>Управление</strong> — циклы, условия, ожидание</li>
  <li><strong>Переменные</strong> — для хранения значений</li>
</ul>
<h3>Пример: проехать 30 см и развернуться</h3>
<pre><code>Когда программа запускается:
  Двигаться вперёд на 30 см со скоростью 50%
  Подождать 0.5 секунды
  Повернуть направо на 90°
  Остановиться</code></pre>
<div class="callout"><span>💡</span><div>Совет: используйте <strong>относительные значения</strong> (см, градусы), а не время. Так робот будет двигаться одинаково при любом заряде батареи.</div></div>
<h3>Word Blocks → Python</h3>
<p>Когда вы освоитесь с блоками, SPIKE App позволяет переключиться на Python — тот же набор функций, но текстовый код. Это плавный переход к настоящему программированию.</p>`,
        },
        {
          id: 'l_fll_4',
          duration: 50,
          type: 'video',
          title: ml('Стратегия Robot Game', 'Robot Game стратегиясы', 'Robot Game strategy'),
          content: `<h2>Стратегия — половина победы</h2>
<p>За 2 минуты 30 секунд раунда команда должна набрать максимум очков. Идеальная стратегия учитывает не только сложность миссий, но и риск, расположение, время и порядок выполнения.</p>
<h3>Формула выбора миссий</h3>
<p>Для каждой миссии оцените:</p>
<ul>
  <li><strong>Очки</strong> — сколько баллов даёт миссия</li>
  <li><strong>Сложность</strong> — какова вероятность успеха (50%? 90%?)</li>
  <li><strong>Время</strong> — сколько секунд займёт выполнение</li>
  <li><strong>Зависимости</strong> — нужно ли что-то сделать заранее</li>
</ul>
<p>Используйте таблицу: миссии с высокой ценностью × высокой надёжностью идут в первую очередь.</p>
<h3>Принципы планирования</h3>
<ol>
  <li><strong>Группируйте миссии по локации</strong> — не возвращайтесь к базе зря</li>
  <li><strong>Используйте съёмные модули (attachments)</strong> — быстрая смена насадки = время</li>
  <li><strong>Закладывайте 15-20 секунд резерва</strong> — на ошибки и подходы</li>
  <li><strong>Тренируйте 2-3 запасных сценария</strong> — если что-то пошло не так</li>
</ol>
<div class="callout"><span>🎯</span><div>Лучшие команды выполняют 6-8 миссий за раунд из ~15 возможных, но делают их стабильно — каждый раз.</div></div>`,
        },
        {
          id: 'l_fll_5',
          duration: 60,
          type: 'project',
          title: ml('Финальный турнир команды', 'Команданың финалдық турнирі', 'Team final tournament'),
          content: `<h2>Турнир внутри академии</h2>
<p>Этот урок — кульминация курса. Команды демонстрируют готового робота, проводят Robot Game на настоящем поле и презентуют Innovation Project жюри академии.</p>
<h3>Формат соревнования</h3>
<ul>
  <li><strong>Robot Game</strong> — 3 раунда по 2:30, в зачёт идёт лучший</li>
  <li><strong>Robot Design Review</strong> — 10-минутная техническая презентация конструкции и кода</li>
  <li><strong>Innovation Project</strong> — 5 минут презентации + 5 минут вопросов жюри</li>
  <li><strong>Core Values</strong> — наблюдение жюри за командной работой во всех активностях</li>
</ul>
<h3>Чек-лист перед турниром</h3>
<ol>
  <li>Робот собран, все съёмные модули подписаны</li>
  <li>Программы загружены в хаб и протестированы</li>
  <li>Запасные батарейки заряжены</li>
  <li>Innovation Project — стенд, презентация, прототип</li>
  <li>Командная футболка / форма</li>
  <li>Хорошо выспаться накануне 😴</li>
</ol>
<div class="callout"><span>🏆</span><div>Победители турнира академии получают приоритет в подаче заявок на национальный отбор FLL Kazakhstan.</div></div>`,
        },
      ],
    },

    // -------------------- FIRST Tech Challenge --------------------
    {
      id: 'c_ftc',
      slug: 'first-tech-challenge',
      categoryKey: 'cat.competitions',
      levelKey: 'level.intermediate',
      durationWeeks: 12,
      hours: 48,
      students: 786,
      rating: 4.8,
      featured: true,
      cover: 'ftc',
      title: ml(
        'FIRST Tech Challenge: робот следующего уровня',
        'FIRST Tech Challenge: келесі деңгейдегі робот',
        'FIRST Tech Challenge: Next-level Robot'
      ),
      tagline: ml(
        'От LEGO к металлу: программируем на Java и побеждаем на FTC',
        'LEGO-дан металлға: Java-да бағдарламалап, FTC-да жеңеміз',
        'From LEGO to metal: program in Java and win at FTC'
      ),
      description: ml(
        'FIRST Tech Challenge — соревнование для подростков 12-18 лет, следующая ступень после FLL. Команды строят роботов из металлических деталей REV Robotics, программируют на Java/Kotlin в Android Studio и сражаются в альянсах на поле 3.6 × 3.6 м. Курс охватывает механику, электронику, программирование и стратегию.',
        'FIRST Tech Challenge — 12-18 жастағы жасөспірімдерге арналған, FLL-дан кейінгі келесі сатылы жарыс. Командалар REV Robotics металл бөлшектерінен робот жасайды, Android Studio-да Java/Kotlin-де бағдарламалайды және 3.6 × 3.6 м алаңда альянстарда жарысады.',
        'FIRST Tech Challenge is for teens aged 12-18, the next step after FLL. Teams build robots from REV Robotics metal parts, program in Java/Kotlin via Android Studio, and compete in alliances on a 3.6 × 3.6 m field.'
      ),
      objectives: [
        ml('Проектировать металлические шасси на REV Robotics',
           'REV Robotics-те металл шассилерді жобалау',
           'Design metal chassis using REV Robotics'),
        ml('Программировать на Java в Android Studio',
           'Android Studio-да Java-да бағдарламалау',
           'Program in Java using Android Studio'),
        ml('Работать с энкодерами, IMU и компьютерным зрением',
           'Энкодерлермен, IMU және компьютерлік көрумен жұмыс істеу',
           'Work with encoders, IMU, and computer vision'),
        ml('Применять PID-регуляторы для точного управления',
           'Дәл басқару үшін PID-реттегіштерді қолдану',
           'Apply PID controllers for precise control'),
      ],
      instructor: {
        name: 'Данияр Сулейменов',
        avatar: 'Д',
        role: ml('FTC Mentor, NU alumni', 'FTC тәлімгері, НУ түлегі', 'FTC Mentor, NU alumni'),
        bio: ml(
          'Капитан команды NU Robotics, выпускник Назарбаев Университета. Призёр FTC Asia Open Championship.',
          'NU Robotics командасының капитаны, Назарбаев Университетінің түлегі. FTC Asia Open Championship жүлдегері.',
          'Captain of NU Robotics team, Nazarbayev University graduate. Award winner at FTC Asia Open Championship.'
        ),
      },
      lessons: [
        { id: 'l_ftc_1', duration: 35, type: 'video', title: ml('Что такое FTC и чем отличается от FLL','FTC деген не және FLL-дан несімен ерекшеленеді','What is FTC and how it differs from FLL'), content: `<h2>Следующий шаг после FLL</h2>
<p>FIRST Tech Challenge (FTC) — это лига, в которую переходят выпускники FLL и подростки, желающие серьёзно заняться робототехникой. Здесь уже нет LEGO — только металлические детали, мощные моторы и полноценное программирование.</p>
<h3>Главные отличия от FLL</h3>
<table style="width:100%;border-collapse:collapse;margin:1rem 0">
  <tr style="background:#f1f5f9"><th style="text-align:left;padding:8px;border:1px solid #e2e8f0">Параметр</th><th style="text-align:left;padding:8px;border:1px solid #e2e8f0">FLL</th><th style="text-align:left;padding:8px;border:1px solid #e2e8f0">FTC</th></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0">Возраст</td><td style="padding:8px;border:1px solid #e2e8f0">9-16</td><td style="padding:8px;border:1px solid #e2e8f0">12-18</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0">Материалы</td><td style="padding:8px;border:1px solid #e2e8f0">LEGO SPIKE</td><td style="padding:8px;border:1px solid #e2e8f0">REV Robotics, металл</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0">Код</td><td style="padding:8px;border:1px solid #e2e8f0">Scratch / Python</td><td style="padding:8px;border:1px solid #e2e8f0">Java / Kotlin</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0">Размер поля</td><td style="padding:8px;border:1px solid #e2e8f0">2.4 × 1.2 м</td><td style="padding:8px;border:1px solid #e2e8f0">3.6 × 3.6 м</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0">Альянсы</td><td style="padding:8px;border:1px solid #e2e8f0">Нет</td><td style="padding:8px;border:1px solid #e2e8f0">2 vs 2</td></tr>
</table>
<h3>Структура матча</h3>
<ul>
  <li><strong>Autonomous (30 сек)</strong> — робот действует без управления</li>
  <li><strong>TeleOp (2 мин)</strong> — пилоты управляют джойстиками</li>
  <li><strong>Endgame (30 сек)</strong> — финальные задания на максимум очков</li>
</ul>
<div class="callout"><span>🤝</span><div>На матче ваша команда в альянсе с другой — нужно договариваться о стратегии. Это уникальный навык FTC.</div></div>` },
        { id: 'l_ftc_2', duration: 50, type: 'video', title: ml('REV Robotics: набор и инструменты','REV Robotics: жинақ пен құралдар','REV Robotics: kit and tools'), content: `<h2>Набор REV Robotics</h2>
<p>REV Robotics — официальный поставщик деталей для FTC. Их система спроектирована так, чтобы сочетать прочность металла с простотой сборки.</p>
<h3>Электроника</h3>
<ul>
  <li><strong>Control Hub</strong> — мозг робота на Android с предустановленной FTC SDK</li>
  <li><strong>Expansion Hub</strong> — дополнительные порты для моторов и сенсоров</li>
  <li><strong>Driver Hub</strong> — для геймпадов пилотов</li>
  <li><strong>Servo Hub</strong> — управление до 6 серво на один порт</li>
</ul>
<h3>Механика</h3>
<ul>
  <li><strong>Extrusion 15mm</strong> — алюминиевый профиль для шасси</li>
  <li><strong>HD Hex моторы</strong> — двигатели с энкодерами</li>
  <li><strong>Mecanum wheels</strong> — омни-колёса для движения вбок</li>
  <li><strong>REV Slides</strong> — линейные направляющие для подъёмников</li>
</ul>
<h3>Датчики</h3>
<ul>
  <li>IMU (встроенный в Control Hub) — углы и ускорения</li>
  <li>Distance Sensor (TOF) — точное измерение расстояния</li>
  <li>Color Sensor — определение цвета объектов</li>
  <li>Touch Sensor — концевики и кнопки</li>
</ul>
<pre><code># Типовая конфигурация хабов в FTC SDK
hardwareMap.dcMotor.get("left_drive")
hardwareMap.dcMotor.get("right_drive")
hardwareMap.servo.get("claw")
hardwareMap.get(BNO055IMU.class, "imu")</code></pre>` },
        { id: 'l_ftc_3', duration: 60, type: 'video', title: ml('Программирование на Java','Java-да бағдарламалау','Programming in Java'), content: `<h2>Java для FTC</h2>
<p>FTC SDK основан на Android. Это значит, что мы пишем настоящие Android-приложения, только вместо UI — управление роботом. Используется Android Studio + FTC библиотеки.</p>
<h3>OpMode и LinearOpMode</h3>
<p>Программа для робота — это класс, наследующийся от <code>OpMode</code> или <code>LinearOpMode</code>:</p>
<pre><code>@TeleOp(name = "Main TeleOp", group = "Linear")
public class TeleOpMain extends LinearOpMode {
    private DcMotor leftDrive, rightDrive;
    private Servo claw;

    @Override
    public void runOpMode() {
        // Инициализация — выполняется один раз перед стартом
        leftDrive = hardwareMap.get(DcMotor.class, "left_drive");
        rightDrive = hardwareMap.get(DcMotor.class, "right_drive");
        claw = hardwareMap.get(Servo.class, "claw");

        waitForStart(); // ждём нажатия Play на Driver Hub

        // Главный цикл — пока матч идёт
        while (opModeIsActive()) {
            double drive = -gamepad1.left_stick_y;
            double turn  =  gamepad1.right_stick_x;
            leftDrive.setPower(drive + turn);
            rightDrive.setPower(drive - turn);

            if (gamepad1.a) claw.setPosition(0.0);
            if (gamepad1.b) claw.setPosition(1.0);

            telemetry.addData("Drive", drive);
            telemetry.update();
        }
    }
}</code></pre>
<h3>Аннотации @TeleOp и @Autonomous</h3>
<p>Аннотация говорит SDK, как отображать OpMode на Driver Hub:</p>
<ul>
  <li><code>@TeleOp</code> — режим с управлением геймпадами</li>
  <li><code>@Autonomous</code> — автономный режим (30 сек начала матча)</li>
  <li><code>@Disabled</code> — спрятать из меню</li>
</ul>` },
        { id: 'l_ftc_4', duration: 55, type: 'video', title: ml('Автономный режим и одометрия','Автономды режим және одометрия','Autonomous mode and odometry'), content: `<h2>Автономный режим</h2>
<p>Первые 30 секунд матча робот действует без управления — это <strong>Autonomous</strong>. Здесь ценятся точные перемещения и стабильность.</p>
<h3>Энкодеры — глаза робота</h3>
<p>Каждый HD Hex мотор имеет встроенный энкодер: 537.7 тиков на оборот вала. Зная диаметр колеса, можно посчитать, сколько тиков = 1 см.</p>
<pre><code>// Колесо 75 мм → длина окружности 235.6 мм
// На 1 см нужно 537.7 / 23.56 ≈ 22.8 тика
int TICKS_PER_CM = 23;

void driveForward(double cm) {
    int target = (int)(cm * TICKS_PER_CM);
    leftDrive.setTargetPosition(target);
    rightDrive.setTargetPosition(target);
    leftDrive.setMode(DcMotor.RunMode.RUN_TO_POSITION);
    rightDrive.setMode(DcMotor.RunMode.RUN_TO_POSITION);
    leftDrive.setPower(0.6);
    rightDrive.setPower(0.6);
    while (leftDrive.isBusy() && opModeIsActive()) {}
}</code></pre>
<h3>Одометрия (Dead Wheels)</h3>
<p>Для большей точности используют три неприводных колеса с энкодерами. Они скользят по полю и точно отслеживают (x, y, θ) робота независимо от пробуксовки приводных колёс.</p>
<h3>IMU для поворотов</h3>
<pre><code>double targetAngle = 90; // повернуть на 90°
double currentAngle = imu.getRobotYawPitchRollAngles().getYaw(AngleUnit.DEGREES);
while (Math.abs(currentAngle - targetAngle) > 1.0) {
    double power = (targetAngle - currentAngle) * 0.02; // P-регулятор
    leftDrive.setPower(power);
    rightDrive.setPower(-power);
    currentAngle = imu.getRobotYawPitchRollAngles().getYaw(AngleUnit.DEGREES);
}</code></pre>
<div class="callout"><span>📐</span><div>В Autonomous каждая ошибка накапливается. Хороший автономный код использует обратную связь от датчиков, а не «времянку».</div></div>` },
        { id: 'l_ftc_5', duration: 45, type: 'video', title: ml('Альянсная стратегия','Альянс стратегиясы','Alliance strategy'), content: `<h2>Игра в альянсе</h2>
<p>В FTC две команды (с разных регистраций) образуют альянс на каждый матч. До матча у вас есть несколько минут, чтобы договориться о ролях.</p>
<h3>Распределение ролей</h3>
<ul>
  <li><strong>Scorer</strong> — основной роль игрок, набирает очки</li>
  <li><strong>Defender</strong> — мешает противникам набирать очки</li>
  <li><strong>Hybrid</strong> — гибкая роль, переключается по ситуации</li>
</ul>
<h3>Зоны поля</h3>
<p>Поле 3.6×3.6 м разделено на функциональные зоны. Договоритесь, кто работает где, чтобы не блокировать друг друга.</p>
<h3>Endgame синхронизация</h3>
<p>В последние 30 секунд многие сезоны требуют выполнить специальное задание (повиснуть, припарковаться). Альянсы координируют это вместе.</p>
<div class="callout"><span>🤝</span><div>Уважительное общение с альянсом — это часть Gracious Professionalism, ключевой ценности FIRST.</div></div>` },
        { id: 'l_ftc_6', duration: 90, type: 'project', title: ml('Квалификационный матч академии','Академияның квалификациялық матчы','Academy qualification match'), content: `<h2>Квалификационный турнир USTEM</h2>
<p>Финал курса — настоящий FTC-матч на поле академии с участием 4-8 команд курса. Победитель получает приоритет в подаче на FTC Kazakhstan.</p>
<h3>Программа дня</h3>
<ol>
  <li><strong>09:00</strong> Регистрация, технический осмотр роботов</li>
  <li><strong>10:00</strong> 5 квалификационных раундов (рандомные альянсы)</li>
  <li><strong>13:00</strong> Альянсная выборка — топ-2 команды формируют свои альянсы</li>
  <li><strong>14:00</strong> Полуфиналы и финал (best of 3)</li>
  <li><strong>16:00</strong> Награждение и разбор турнира</li>
</ol>
<h3>Технический осмотр</h3>
<ul>
  <li>Размеры робота ≤ 45×45×45 см (на старте)</li>
  <li>Аккумулятор закреплён, провода скрыты</li>
  <li>E-stop работает</li>
  <li>Никаких острых выступов</li>
</ul>
<div class="callout"><span>🏆</span><div>Победители прошлого турнира представляли Казахстан на FTC Asia Pacific Open Championship.</div></div>` },
      ],
    },

    // -------------------- WSO Robotics --------------------
    {
      id: 'c_wso',
      slug: 'wso-robotics',
      categoryKey: 'cat.competitions',
      levelKey: 'level.advanced',
      durationWeeks: 16,
      hours: 64,
      students: 312,
      rating: 4.9,
      featured: true,
      cover: 'wso',
      title: ml(
        'WorldSkills: подготовка к олимпиаде по робототехнике',
        'WorldSkills: робототехника олимпиадасына дайындық',
        'WorldSkills Robotics: Olympiad Prep'
      ),
      tagline: ml(
        'Олимпиадная подготовка к WorldSkills Mobile Robotics — путь к мировой сцене',
        'WorldSkills Mobile Robotics-ке олимпиадалық дайындық — әлемдік сахнаға жол',
        'Olympiad-level prep for WorldSkills Mobile Robotics — your path to the world stage'
      ),
      description: ml(
        'Интенсивный курс для подготовки к компетенции "Мобильная робототехника" на WorldSkills (WSO). Программируем мобильных роботов на C++/Python, работаем с лидарами, камерами, навигацией. Подходит для участников от 16 лет с базой по программированию. Тренеры — призёры WorldSkills Asia и Europe.',
        'WorldSkills (WSO) "Мобильді робототехника" компетенциясына дайындалуға арналған қарқынды курс. C++/Python-да мобильді роботтарды бағдарламалап, лидарлармен, камералармен, навигациямен жұмыс істейміз. Бағдарламалау негізі бар 16 жастан асқан қатысушыларға арналған.',
        'Intensive prep course for the WorldSkills (WSO) "Mobile Robotics" competition. Program mobile robots in C++/Python, work with LIDAR, cameras, navigation. For participants 16+ with programming basics. Coaches are WorldSkills Asia and Europe medalists.'
      ),
      objectives: [
        ml('Решать классические WSO-задачи: лабиринт, сортировка, картирование',
           'Классикалық WSO тапсырмаларын шешу: лабиринт, сұрыптау, картаға түсіру',
           'Solve classic WSO tasks: maze, sorting, mapping'),
        ml('Программировать на C++ под платформу WSO',
           'WSO платформасы үшін C++-та бағдарламалау',
           'Program in C++ for the WSO platform'),
        ml('Использовать лидар и обработку изображений (OpenCV)',
           'Лидарды және сурет өңдеуді (OpenCV) қолдану',
           'Use LIDAR and image processing (OpenCV)'),
        ml('Готовиться к национальному и международному этапу',
           'Ұлттық және халықаралық кезеңдерге дайындалу',
           'Prepare for national and international stages'),
      ],
      instructor: {
        name: 'Бекжан Нурланулы',
        avatar: 'Б',
        role: ml('WorldSkills Coach, Bronze Medal', 'WorldSkills бапкері, қола медаль', 'WorldSkills Coach, Bronze Medal'),
        bio: ml(
          'Призёр WorldSkills Europe 2023 (Mobile Robotics). Готовит сборную Казахстана с 2019 года.',
          'WorldSkills Europe 2023 (Mobile Robotics) жүлдегері. 2019 жылдан бері Қазақстан құрама командасын дайындайды.',
          'WorldSkills Europe 2023 (Mobile Robotics) medalist. Coaching Team Kazakhstan since 2019.'
        ),
      },
      lessons: [
        { id: 'l_wso_1', duration: 45, type: 'video', title: ml('Регламент WorldSkills Mobile Robotics','WorldSkills Mobile Robotics регламенті','WorldSkills Mobile Robotics rules'), content: `<h2>WorldSkills: профессиональная олимпиада</h2>
<p>WorldSkills (часто называется WSO) — крупнейшая в мире олимпиада профессионального мастерства. Компетенция «Мобильная робототехника» (CS-23) — одна из самых престижных и сложных.</p>
<h3>Этапы соревнования</h3>
<ul>
  <li><strong>Региональный этап</strong> — отбор внутри области</li>
  <li><strong>Национальный финал</strong> — определение сборной Казахстана</li>
  <li><strong>WorldSkills Asia / Europe</strong> — континентальные первенства</li>
  <li><strong>WorldSkills Global</strong> — раз в 2 года, мировой финал</li>
</ul>
<h3>Структура задания</h3>
<p>Команда из 2 человек получает техническое задание (ТЗ) за 3-4 дня до соревнования. ТЗ описывает миссии, которые робот должен выполнять автономно на поле 4×4 м с препятствиями, объектами, маркерами.</p>
<h3>Критерии оценки</h3>
<ul>
  <li><strong>40%</strong> — выполнение миссий (объективные баллы)</li>
  <li><strong>30%</strong> — техническая документация</li>
  <li><strong>20%</strong> — качество кода и архитектуры</li>
  <li><strong>10%</strong> — презентация и защита</li>
</ul>
<div class="callout"><span>🇰🇿</span><div>Сборная Казахстана по Mobile Robotics стабильно входит в топ-15 на WorldSkills Global с 2017 года.</div></div>` },
        { id: 'l_wso_2', duration: 60, type: 'video', title: ml('Аппаратная платформа WSO','WSO аппараттық платформасы','WSO hardware platform'), content: `<h2>Робот для WorldSkills</h2>
<p>На WSO команды используют унифицированную платформу — обычно это робот собственной сборки из стандартного набора компонентов.</p>
<h3>Типичная конфигурация</h3>
<ul>
  <li><strong>Контроллер:</strong> NVIDIA Jetson Nano / Orin Nano (или Raspberry Pi 5)</li>
  <li><strong>Драйвер моторов:</strong> Cytron MDD10A или аналог</li>
  <li><strong>Моторы:</strong> 4 редукторных мотора с энкодерами</li>
  <li><strong>LIDAR:</strong> RPLIDAR A1 / A2 (360° сканирование)</li>
  <li><strong>Камера:</strong> Intel RealSense D435 (RGB+Depth) или USB-камера</li>
  <li><strong>IMU:</strong> MPU-9250 или BNO055</li>
  <li><strong>Манипулятор:</strong> 4-DOF servo-arm для захвата объектов</li>
</ul>
<h3>Программный стек</h3>
<ul>
  <li>Ubuntu 22.04 + ROS 2 Humble</li>
  <li>OpenCV для зрения</li>
  <li>SLAM Toolbox для картирования</li>
  <li>Nav2 для планирования пути</li>
  <li>Свои Python/C++ ноды для логики миссий</li>
</ul>
<pre><code># Типовая конфигурация .launch.py
Node(package='rplidar_ros', executable='rplidar_composition'),
Node(package='slam_toolbox', executable='async_slam_toolbox_node'),
Node(package='nav2_bringup', executable='bringup_launch.py'),
Node(package='my_robot', executable='mission_executor')</code></pre>` },
        { id: 'l_wso_3', duration: 70, type: 'video', title: ml('Навигация и SLAM','Навигация және SLAM','Navigation and SLAM'), content: `<h2>SLAM: одновременная локализация и картирование</h2>
<p>SLAM (Simultaneous Localization and Mapping) — задача построения карты неизвестной среды и одновременного отслеживания положения робота на этой карте.</p>
<h3>Популярные алгоритмы</h3>
<ul>
  <li><strong>Gmapping</strong> — классика на основе частиц, простой в настройке</li>
  <li><strong>Cartographer</strong> — Google, точный, требует ресурсов</li>
  <li><strong>SLAM Toolbox</strong> — современный, рекомендован для ROS 2</li>
</ul>
<h3>Принцип работы</h3>
<ol>
  <li>LIDAR делает скан окружения 360°</li>
  <li>Алгоритм сопоставляет текущий скан с предыдущей картой</li>
  <li>Обновляется позиция робота</li>
  <li>Карта дополняется новыми наблюдениями</li>
</ol>
<h3>Локализация без SLAM (AMCL)</h3>
<p>Если карта уже построена, для определения позиции используется <strong>AMCL</strong> (Adaptive Monte Carlo Localization) — фильтр частиц, который оценивает позицию по новым сканам и известной карте.</p>
<h3>Планирование пути (Nav2)</h3>
<pre><code># Глобальное планирование — A* или NavFn
# Локальное планирование — DWB (Dynamic Window Behavior)
# Recovery behaviors — что делать при застревании

# Отправка цели роботу:
from nav2_simple_commander.robot_navigator import BasicNavigator
nav = BasicNavigator()
nav.goToPose(create_pose(2.5, 1.5, 0.0))
while not nav.isTaskComplete():
    feedback = nav.getFeedback()</code></pre>
<div class="callout"><span>⚠️</span><div>На соревнованиях карту строят в первые 30 секунд миссии. После этого режим переключается с SLAM на AMCL для стабильности.</div></div>` },
        { id: 'l_wso_4', duration: 65, type: 'video', title: ml('Компьютерное зрение в реальном времени','Нақты уақыттағы компьютерлік көру','Real-time computer vision'), content: `<h2>Видение робота</h2>
<p>На WSO миссии часто включают распознавание цветных объектов, ArUco-маркеров, или классификацию форм. Главное требование — работа в реальном времени (15-30 FPS на Jetson).</p>
<h3>Распознавание цветных объектов</h3>
<pre><code>import cv2
import numpy as np

cap = cv2.VideoCapture(0)
while True:
    ret, frame = cap.read()
    hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)

    # Маска для красных объектов
    lower = np.array([0, 120, 70])
    upper = np.array([10, 255, 255])
    mask = cv2.inRange(hsv, lower, upper)

    # Поиск контуров
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    for c in contours:
        if cv2.contourArea(c) > 500:
            x, y, w, h = cv2.boundingRect(c)
            cv2.rectangle(frame, (x,y), (x+w,y+h), (0,255,0), 2)</code></pre>
<h3>ArUco маркеры</h3>
<p>ArUco — это квадратные маркеры с уникальным узором. Идеальны для разметки зон, объектов и точной локализации.</p>
<pre><code>dictionary = cv2.aruco.getPredefinedDictionary(cv2.aruco.DICT_4X4_50)
corners, ids, _ = cv2.aruco.detectMarkers(gray, dictionary)
if ids is not None:
    # ids — массив идентификаторов найденных маркеров
    # corners — координаты их углов в кадре
    rvecs, tvecs, _ = cv2.aruco.estimatePoseSingleMarkers(corners, 0.05, cameraMatrix, distCoeffs)</code></pre>
<h3>Deep Learning подход</h3>
<p>Для сложных миссий используют нейросети: <strong>YOLOv8n</strong> для обнаружения, <strong>TensorRT</strong> для ускорения на Jetson. Это даёт точность 90%+ при 30 FPS.</p>` },
        { id: 'l_wso_5', duration: 75, type: 'video', title: ml('Задачи прошлых лет: разбор','Өткен жылдардағы тапсырмалар: талдау','Past competition tasks analysis'), content: `<h2>Анализ заданий прошлых лет</h2>
<p>Лучший способ подготовиться — изучить реальные задачи WorldSkills. Разберём 3 показательных кейса.</p>
<h3>Kazan 2019: «Сортировка биомассы»</h3>
<p>Робот должен был собрать цветные объекты с поля и разложить по корзинам соответствующего цвета, избегая препятствий. Ключевой вызов — точная навигация + распознавание.</p>
<h3>Shanghai 2022: «Умный склад»</h3>
<p>Имитация склада с QR-кодами на полу. Робот получал список заданий и должен был доставлять «грузы» между ячейками. Победители использовали SLAM + диспетчер задач.</p>
<h3>Lyon 2024: «Спасательная операция»</h3>
<p>Поле имитировало завалы. Робот должен был найти «пострадавших» (тепловые источники), сообщить их координаты на пульт оператора и принести им «аптечку». Сложность — комбинация ИК-зрения и навигации.</p>
<h3>Общие принципы</h3>
<ul>
  <li><strong>Декомпозиция миссии</strong> — разбейте на 5-7 независимых модулей</li>
  <li><strong>Симулятор</strong> — отлаживайте в Gazebo, не на железе</li>
  <li><strong>Fallback план</strong> — что делать если основной алгоритм провалится</li>
  <li><strong>Документация</strong> — на оценку, не для красоты</li>
</ul>
<div class="callout"><span>📚</span><div>Архив ТЗ предыдущих лет доступен в библиотеке академии. Возьмите 3 кейса и решите их самостоятельно — это лучшая подготовка.</div></div>` },
        { id: 'l_wso_6', duration: 120, type: 'project', title: ml('Симуляция соревнования','Жарыс симуляциясы','Competition simulation'), content: `<h2>Полная симуляция соревнования</h2>
<p>Финал курса — это 4-часовой марафон, имитирующий реальный день WorldSkills. Условия максимально приближены к боевым.</p>
<h3>Сценарий дня</h3>
<ol>
  <li><strong>09:00</strong> Команды получают новое ТЗ (которое они не видели ранее)</li>
  <li><strong>09:00 – 11:00</strong> Анализ задания, проектирование решения, написание кода</li>
  <li><strong>11:00 – 13:00</strong> Отладка на симуляторе Gazebo</li>
  <li><strong>13:00 – 14:00</strong> Перерыв, развёртывание на железо</li>
  <li><strong>14:00 – 15:30</strong> Соревновательные заезды (3 попытки по 5 минут)</li>
  <li><strong>15:30 – 16:30</strong> Защита решения перед жюри</li>
</ol>
<h3>Критерии оценки финала</h3>
<ul>
  <li>Количество выполненных миссий</li>
  <li>Стабильность от заезда к заезду</li>
  <li>Качество кода (read-readable, модульный)</li>
  <li>Глубина презентации</li>
</ul>
<h3>После финала</h3>
<p>Топ-3 команды получают приглашение в сборную академии для подготовки к национальному отбору WorldSkills Kazakhstan.</p>
<div class="callout"><span>🥇</span><div>В 2024 году команда выпускников этого курса заняла бронзу на WorldSkills Asia в Сеуле.</div></div>` },
      ],
    },

    // -------------------- Robotics --------------------
    {
      id: 'c_robotics',
      slug: 'robotics-foundations',
      categoryKey: 'cat.robotics',
      levelKey: 'level.beginner',
      durationWeeks: 6,
      hours: 24,
      students: 2456,
      rating: 4.7,
      featured: true,
      cover: 'robotics',
      title: ml(
        'Робототехника с нуля',
        'Нөлден бастап робототехника',
        'Robotics from Zero'
      ),
      tagline: ml(
        'Полный старт: датчики, моторы, контроллеры и первые проекты',
        'Толық старт: сенсорлар, моторлар, контроллерлер және алғашқы жобалар',
        'Full start: sensors, motors, controllers, and first projects'
      ),
      description: ml(
        'Универсальный вводный курс, который даёт фундамент для любого направления робототехники. Подходит школьникам и взрослым без опыта. Изучаем основы электроники, кинематику, типы датчиков, принципы управления и собираем первого мобильного робота на колёсной платформе.',
        'Робототехниканың кез келген бағытына іргетас беретін әмбебап кіріспе курс. Тәжірибесіз мектеп оқушыларына және ересектерге жарайды. Электроника негіздерін, кинематиканы, сенсорлар түрлерін, басқару қағидаларын зерттеп, дөңгелекті платформадағы алғашқы мобильді роботты құрастырамыз.',
        'A universal intro course that lays the foundation for any robotics direction. Suitable for school students and adults with no experience. We cover electronics basics, kinematics, sensor types, control principles, and build a first mobile robot on a wheeled platform.'
      ),
      objectives: [
        ml('Понимать ключевые компоненты роботов', 'Робот компоненттерін түсіну', 'Understand key robot components'),
        ml('Различать виды датчиков и их применение', 'Сенсорлар түрлерін ажырату', 'Distinguish sensor types and their applications'),
        ml('Управлять моторами через H-мост и драйверы', 'H-көпір арқылы моторларды басқару', 'Control motors using H-bridge drivers'),
        ml('Собрать колёсную платформу с управлением', 'Басқарылатын дөңгелекті платформа құрастыру', 'Assemble a controllable wheeled platform'),
      ],
      instructor: {
        name: 'Айгерим Касенова',
        avatar: 'А',
        role: ml('Robotics Engineer', 'Робототехника инженері', 'Robotics Engineer'),
        bio: ml(
          'Инженер-робототехник, выпускница КазНИТУ. Преподаёт более 5 лет, автор образовательных программ для школ Алматы.',
          'Робототехника инженері, ҚазҰТЗУ түлегі. 5 жылдан астам оқытады, Алматы мектептеріне арналған білім беру бағдарламаларының авторы.',
          'Robotics engineer, KazNRTU graduate. Teaching for 5+ years, author of educational programs for Almaty schools.'
        ),
      },
      lessons: [
        { id: 'l_rob_1', duration: 25, type: 'video', title: ml('Что такое робот','Робот деген не','What is a robot'), content: `<h2>Что такое робот?</h2>
<p>Робот — это автономная или полу-автономная машина, которая воспринимает окружение через датчики, принимает решения и действует на мир через моторы и приводы.</p>
<h3>Три составляющие любого робота</h3>
<ol>
  <li><strong>Sense (восприятие)</strong> — датчики собирают информацию о мире</li>
  <li><strong>Think (мышление)</strong> — контроллер обрабатывает данные и принимает решения</li>
  <li><strong>Act (действие)</strong> — моторы и приводы выполняют действие</li>
</ol>
<h3>Категории роботов</h3>
<ul>
  <li><strong>Промышленные</strong> — сварка, сборка, упаковка (KUKA, ABB)</li>
  <li><strong>Мобильные</strong> — перемещаются по среде (доставка, склады)</li>
  <li><strong>Гуманоидные</strong> — повторяют форму человека (Unitree G1, Tesla Optimus)</li>
  <li><strong>Коллаборативные</strong> — работают рядом с людьми (UR, Franka)</li>
  <li><strong>Образовательные</strong> — для обучения (LEGO, VEX)</li>
</ul>
<div class="callout"><span>🤖</span><div>По данным IFR, к 2026 году в мире работает более 5 миллионов промышленных роботов. Казахстан входит в топ-30 стран по плотности роботизации в СНГ.</div></div>
<h3>Что мы будем изучать</h3>
<p>В этом курсе вы пройдёте путь от понимания электричества до сборки первого мобильного робота с управлением. Все занятия — практические.</p>` },
        { id: 'l_rob_2', duration: 35, type: 'video', title: ml('Основы электроники','Электроника негіздері','Electronics basics'), content: `<h2>Электричество для робототехника</h2>
<p>Чтобы понимать, как работает электроника робота, нужно знать три базовые величины и закон, который их связывает.</p>
<h3>Три кита электричества</h3>
<ul>
  <li><strong>Напряжение (V, вольт)</strong> — «давление» электронов в проводе</li>
  <li><strong>Ток (I, ампер)</strong> — «поток» электронов</li>
  <li><strong>Сопротивление (R, ом)</strong> — насколько провод/элемент мешает току</li>
</ul>
<h3>Закон Ома</h3>
<p>Связывает всё вместе: <strong>V = I × R</strong></p>
<pre><code>// Пример: к 5В через резистор 220 Ом подключён светодиод
// I = V / R = 5 / 220 ≈ 23 мА — безопасный ток для LED</code></pre>
<h3>Постоянный (DC) vs Переменный (AC) ток</h3>
<p>Роботы работают на постоянном токе (батарейки, аккумуляторы). Сеть 220В — переменный, его преобразует блок питания.</p>
<h3>Breadboard — наш друг</h3>
<p>Беспаечная макетная плата позволяет быстро собрать схему без пайки. Стандартная плата имеет 830 точек, разделённых на ряды по 5.</p>
<div class="callout"><span>⚡</span><div>Никогда не подключайте мотор напрямую к контроллеру! Используйте драйвер (H-bridge) — иначе спалите контроллер обратным током.</div></div>
<h3>Основные компоненты</h3>
<ul>
  <li><strong>Резистор</strong> — ограничивает ток</li>
  <li><strong>Конденсатор</strong> — сглаживает скачки напряжения</li>
  <li><strong>Диод</strong> — пропускает ток в одну сторону</li>
  <li><strong>Транзистор</strong> — электронный ключ</li>
</ul>` },
        { id: 'l_rob_3', duration: 40, type: 'video', title: ml('Датчики и их типы','Сенсорлар және олардың түрлері','Sensors and their types'), content: `<h2>Датчики — чувства робота</h2>
<p>Робот без датчиков — это просто двигающаяся коробка. Датчики дают ему информацию о мире.</p>
<h3>Датчики расстояния</h3>
<ul>
  <li><strong>Ультразвуковой (HC-SR04)</strong> — 2-400 см, дёшево, шумит на мягких поверхностях</li>
  <li><strong>Инфракрасный (Sharp GP2Y)</strong> — 10-80 см, узкий пучок, влияет освещение</li>
  <li><strong>ToF (VL53L0X / VL53L1X)</strong> — 0-2 м, очень точно, лазерный</li>
  <li><strong>LIDAR</strong> — 360° сканирование, 6-12 м, для серьёзной навигации</li>
</ul>
<h3>Датчики ориентации</h3>
<ul>
  <li><strong>Гироскоп</strong> — измеряет угловую скорость</li>
  <li><strong>Акселерометр</strong> — измеряет ускорение и наклон</li>
  <li><strong>Магнитометр</strong> — компас</li>
  <li><strong>IMU</strong> — это всё в одном чипе (MPU-9250, BNO055)</li>
</ul>
<h3>Датчики окружения</h3>
<ul>
  <li><strong>Цвет (TCS34725)</strong> — RGB значение объекта</li>
  <li><strong>Температура/влажность (DHT22)</strong> — для метеостанций</li>
  <li><strong>Свет (фоторезистор)</strong> — освещённость</li>
  <li><strong>Звук (микрофон)</strong> — для голосовых команд</li>
</ul>
<h3>Цифровые vs аналоговые</h3>
<pre><code>// Цифровой датчик: 0 или 1 (или несколько байт по I2C/SPI)
int touched = digitalRead(2);

// Аналоговый: 0-1023 (10-битный АЦП Arduino)
int light = analogRead(A0);</code></pre>
<div class="callout"><span>📡</span><div>Хороший принцип: один датчик измеряет одну величину. Но в робототехнике часто комбинируют — например, IMU + энкодеры + LIDAR для надёжной локализации.</div></div>` },
        { id: 'l_rob_4', duration: 45, type: 'video', title: ml('Моторы и приводы','Моторлар мен жетектер','Motors and actuators'), content: `<h2>Моторы — мышцы робота</h2>
<p>Мотор превращает электрическую энергию в движение. Для роботов используется три основных типа.</p>
<h3>DC-моторы (коллекторные)</h3>
<ul>
  <li>Простые, дешёвые, мощные</li>
  <li>Скорость регулируется напряжением (PWM)</li>
  <li>Направление меняется полярностью</li>
  <li>Требуют редуктор для крутящего момента</li>
  <li>Управление: H-bridge (L298N, TB6612FNG)</li>
</ul>
<h3>Серво-моторы</h3>
<ul>
  <li>Поворачиваются в конкретный угол (0-180° обычно)</li>
  <li>Управление по PWM сигналу (1000-2000 мкс)</li>
  <li>Идеальны для манипуляторов и захватов</li>
  <li>Популярные модели: SG90, MG996R, Dynamixel</li>
</ul>
<pre><code>// Arduino: установить серво в угол 90°
#include &lt;Servo.h&gt;
Servo s;
s.attach(9);
s.write(90);</code></pre>
<h3>Шаговые моторы (stepper)</h3>
<ul>
  <li>Двигаются дискретными шагами (1.8° = 200 шагов/оборот)</li>
  <li>Точные, но шумные и греются</li>
  <li>Используются в 3D-принтерах, ЧПУ</li>
  <li>Драйверы: A4988, TMC2208</li>
</ul>
<h3>H-bridge: как работает</h3>
<p>4 транзистора соединены в форме буквы H. Переключая их, можно менять направление тока через мотор → менять направление вращения.</p>
<pre><code>// L298N с Arduino
digitalWrite(IN1, HIGH); digitalWrite(IN2, LOW); // вперёд
digitalWrite(IN1, LOW);  digitalWrite(IN2, HIGH); // назад
analogWrite(ENA, 200); // скорость 200/255</code></pre>
<div class="callout"><span>🔥</span><div>Моторы при работе под нагрузкой нагреваются. Всегда добавляйте радиатор драйверу и оставляйте запас по току.</div></div>` },
        { id: 'l_rob_5', duration: 50, type: 'project', title: ml('Первый робот: колёсная платформа','Алғашқы робот: дөңгелекті платформа','First robot: wheeled platform'), content: `<h2>Финальный проект: робот-«объезжайка»</h2>
<p>Собираем мобильного робота на 4 колёсах с управлением по Bluetooth и автономным объездом препятствий.</p>
<h3>Список компонентов</h3>
<ul>
  <li>Шасси с 4 моторами (TT моторы 1:48)</li>
  <li>Arduino Uno</li>
  <li>Драйвер L298N</li>
  <li>HC-SR04 (ультразвуковой датчик)</li>
  <li>HC-05 Bluetooth модуль</li>
  <li>Servo SG90 (поворот датчика)</li>
  <li>Аккумулятор 7.4В Li-ion (2×18650)</li>
  <li>Провода, breadboard</li>
</ul>
<h3>Схема соединений</h3>
<table style="width:100%;border-collapse:collapse;margin:1rem 0">
  <tr style="background:#f1f5f9"><th style="padding:8px;border:1px solid #e2e8f0">Компонент</th><th style="padding:8px;border:1px solid #e2e8f0">Arduino Pin</th></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0">L298N IN1-IN4</td><td style="padding:8px;border:1px solid #e2e8f0">D5, D6, D9, D10</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0">HC-SR04 Trig/Echo</td><td style="padding:8px;border:1px solid #e2e8f0">D11, D12</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0">Servo</td><td style="padding:8px;border:1px solid #e2e8f0">D3</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0">HC-05 TX/RX</td><td style="padding:8px;border:1px solid #e2e8f0">D2 (RX), D4 (TX)</td></tr>
</table>
<h3>Скелет кода</h3>
<pre><code>void loop() {
    int dist = measureDistance();
    if (dist &lt; 20) {
        stop();
        delay(200);
        int leftSpace = lookLeft();
        int rightSpace = lookRight();
        if (leftSpace &gt; rightSpace) turnLeft();
        else turnRight();
    } else {
        forward();
    }
}</code></pre>
<h3>Сдача проекта</h3>
<ol>
  <li>Робот должен пройти трассу 3×3 м с 3 препятствиями автономно</li>
  <li>Демонстрация управления с телефона по Bluetooth</li>
  <li>Видео-отчёт 2-3 минуты</li>
  <li>Загрузка кода в свой профиль</li>
</ol>
<div class="callout"><span>🎉</span><div>После сдачи финального проекта вы получаете сертификат USTEM Academy и приглашение на следующие курсы (Arduino Advanced, ROS).</div></div>` },
      ],
    },

    // -------------------- Arduino --------------------
    {
      id: 'c_arduino',
      slug: 'arduino-zero-to-project',
      categoryKey: 'cat.electronics',
      levelKey: 'level.beginner',
      durationWeeks: 6,
      hours: 28,
      students: 3128,
      rating: 4.8,
      featured: true,
      cover: 'arduino',
      title: ml(
        'Arduino: от нуля до проекта',
        'Arduino: нөлден жобаға дейін',
        'Arduino: From Zero to Project'
      ),
      tagline: ml(
        'Создавайте умные устройства за 6 недель — без опыта в электронике',
        '6 аптада ақылды құрылғылар жасаңыз — электроникада тәжірибесіз',
        'Build smart devices in 6 weeks — no electronics experience needed'
      ),
      description: ml(
        'Курс по Arduino для тех, кто хочет научиться делать собственные электронные устройства. Изучаем язык Arduino (C++), работаем с десятком датчиков и модулей, делаем 5 практических проектов: метеостанция, парктроник, умная теплица, охранная система, IoT-устройство с Wi-Fi.',
        'Өзіңіздің электронды құрылғыларыңызды жасауды үйренгісі келетіндерге арналған Arduino курсы. Arduino тілін (C++) зерттеп, ондаған сенсорлармен жұмыс істеп, 5 практикалық жоба жасаймыз: метеостанция, паркинг сенсоры, ақылды теплица, күзет жүйесі, Wi-Fi IoT құрылғысы.',
        'An Arduino course for those who want to learn to build their own electronic devices. We study the Arduino language (C++), work with a dozen sensors and modules, and make 5 practical projects: weather station, parking sensor, smart greenhouse, security system, IoT device with Wi-Fi.'
      ),
      objectives: [
        ml('Программировать Arduino UNO/Nano/ESP32',
           'Arduino UNO/Nano/ESP32 бағдарламалау',
           'Program Arduino UNO/Nano/ESP32'),
        ml('Читать схемы и собирать на breadboard',
           'Сұлбаларды оқып, breadboard-та құрастыру',
           'Read schematics and assemble on breadboard'),
        ml('Работать с I2C, SPI, UART интерфейсами',
           'I2C, SPI, UART интерфейстерімен жұмыс істеу',
           'Work with I2C, SPI, UART interfaces'),
        ml('Подключать устройства к Wi-Fi и облаку',
           'Құрылғыларды Wi-Fi және бұлтқа қосу',
           'Connect devices to Wi-Fi and the cloud'),
      ],
      instructor: {
        name: 'Тимур Ескендиров',
        avatar: 'Т',
        role: ml('Hardware Engineer, IoT', 'Аппараттық инженер, IoT', 'Hardware Engineer, IoT'),
        bio: ml(
          'Co-founder стартапа AgroTech KZ. Спроектировал десятки устройств для агросектора Казахстана.',
          'AgroTech KZ стартапының бірлескен негізін қалаушы. Қазақстан агросекторы үшін ондаған құрылғылар жобалаған.',
          'Co-founder of AgroTech KZ startup. Designed dozens of devices for Kazakhstan agriculture sector.'
        ),
      },
      lessons: [
        {
          id: 'l_ard_1',
          duration: 25,
          type: 'video',
          title: ml('Что такое Arduino','Arduino деген не','What is Arduino'),
          content: `<h2>Платформа Arduino</h2>
<p>Arduino — это открытая платформа на базе микроконтроллера, позволяющая создавать электронные устройства без глубоких знаний в схемотехнике.</p>
<h3>Популярные модели</h3>
<ul>
  <li><strong>UNO R3</strong> — классика для начинающих</li>
  <li><strong>Nano</strong> — компактная версия</li>
  <li><strong>ESP32</strong> — с Wi-Fi и Bluetooth</li>
</ul>`,
        },
        {
          id: 'l_ard_2',
          duration: 30,
          type: 'video',
          title: ml('Первая программа: Blink','Алғашқы бағдарлама: Blink','First program: Blink'),
          content: `<h2>Hello World робототехники</h2>
<pre><code>void setup() {
  pinMode(LED_BUILTIN, OUTPUT);
}

void loop() {
  digitalWrite(LED_BUILTIN, HIGH);
  delay(500);
  digitalWrite(LED_BUILTIN, LOW);
  delay(500);
}</code></pre>`,
          quiz: {
            questions: [
              {
                q: ml('Какая функция запускается один раз?', 'Қандай функция бір рет іске қосылады?', 'Which function runs once?'),
                options: [ml('loop()','loop()','loop()'), ml('setup()','setup()','setup()'), ml('start()','start()','start()'), ml('main()','main()','main()')],
                correct: 1,
              },
            ],
          },
        },
        { id: 'l_ard_3', duration: 40, type: 'video', title: ml('Цифровые и аналоговые входы','Сандық және аналогты кірістер','Digital and analog inputs'), content: `<h2>Чтение сигналов из мира</h2>
<p>Arduino умеет читать два типа сигналов: цифровые (0/1) и аналоговые (0-1023). Понимание разницы — фундамент работы со всеми датчиками.</p>
<h3>Цифровое чтение</h3>
<p>Используем для кнопок, концевиков, цифровых датчиков.</p>
<pre><code>const int BTN = 2;
void setup() {
    pinMode(BTN, INPUT_PULLUP); // подтяжка к +5В
    Serial.begin(9600);
}
void loop() {
    int state = digitalRead(BTN);
    // С PULLUP: 1 = отпущена, 0 = нажата
    if (state == LOW) Serial.println("Pressed!");
    delay(50);
}</code></pre>
<h3>Аналоговое чтение</h3>
<p>Пины A0-A5 могут читать напряжение 0-5В и преобразовывать его в число 0-1023 (10-битный АЦП).</p>
<pre><code>// Фоторезистор: больше света = меньше сопротивления
int light = analogRead(A0);
float volts = light * 5.0 / 1023.0;
Serial.println(volts);</code></pre>
<h3>Запомните: PULLUP / PULLDOWN</h3>
<p>«Висящий» пин (без подтяжки) показывает случайные значения. Внутренний PULLUP подключает пин через резистор к +5В:</p>
<ul>
  <li>Кнопка отпущена → пин читает <code>HIGH</code> (1)</li>
  <li>Кнопка нажата → пин читает <code>LOW</code> (0)</li>
</ul>
<h3>Антидребезг кнопки</h3>
<p>Механические контакты дребезжат. Программное решение:</p>
<pre><code>if (digitalRead(BTN) == LOW) {
    delay(20); // антидребезг
    if (digitalRead(BTN) == LOW) {
        // точно нажата
    }
}</code></pre>
<div class="callout"><span>📊</span><div>Для измерения температуры через LM35 формула: <code>°C = (analogRead(A0) * 5.0 / 1023.0) * 100</code></div></div>` },
        { id: 'l_ard_4', duration: 50, type: 'video', title: ml('Проект: метеостанция на DHT22','Жоба: DHT22-де метеостанция','Project: weather station on DHT22'), content: `<h2>Метеостанция своими руками</h2>
<p>Соберём прибор, который читает температуру и влажность с DHT22 и показывает их на OLED-экране. Базовый, но реальный проект — каждый дом мог бы такой иметь.</p>
<h3>Компоненты</h3>
<ul>
  <li>Arduino Nano</li>
  <li>DHT22 (или AM2302) — датчик температуры/влажности</li>
  <li>OLED 0.96" SSD1306 — экран 128×64</li>
  <li>Резистор 10 кОм (подтяжка для DHT)</li>
</ul>
<h3>Подключение</h3>
<pre><code>DHT22:
  VCC → 5V
  GND → GND
  DATA → D2 (через 10к на VCC)

OLED:
  VCC → 3.3V
  GND → GND
  SDA → A4
  SCL → A5</code></pre>
<h3>Полный код</h3>
<pre><code>#include &lt;DHT.h&gt;
#include &lt;Adafruit_SSD1306.h&gt;

#define DHTPIN 2
DHT dht(DHTPIN, DHT22);
Adafruit_SSD1306 display(128, 64, &amp;Wire);

void setup() {
    dht.begin();
    display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
}

void loop() {
    float t = dht.readTemperature();
    float h = dht.readHumidity();

    display.clearDisplay();
    display.setTextSize(2);
    display.setTextColor(SSD1306_WHITE);

    display.setCursor(0, 0);
    display.print("T: "); display.print(t, 1); display.println(" C");
    display.setCursor(0, 30);
    display.print("H: "); display.print(h, 0); display.println(" %");

    display.display();
    delay(2000);
}</code></pre>
<h3>Усложнение</h3>
<ul>
  <li>Добавить хранение минимума/максимума за сутки</li>
  <li>Сохранять данные в EEPROM при отключении питания</li>
  <li>Поставить кнопку для переключения «текущее / мин / макс»</li>
  <li>Логировать на SD-карту</li>
</ul>
<div class="callout"><span>🌡</span><div>DHT22 точнее DHT11: ±0.5°C против ±2°C. Стоит чуть дороже, но для серьёзного проекта берите его.</div></div>` },
        { id: 'l_ard_5', duration: 60, type: 'video', title: ml('Wi-Fi и облако с ESP32','ESP32 арқылы Wi-Fi және бұлт','Wi-Fi and cloud with ESP32'), content: `<h2>Подключаем устройство к интернету</h2>
<p>ESP32 — это «Arduino с Wi-Fi и Bluetooth». Та же среда программирования (Arduino IDE), но мощнее процессор и есть выход в сеть.</p>
<h3>Почему ESP32, а не Arduino UNO</h3>
<ul>
  <li>240 МГц двухъядерный процессор (UNO — 16 МГц)</li>
  <li>520 КБ RAM (UNO — 2 КБ)</li>
  <li>Wi-Fi b/g/n + Bluetooth 5.0 на борту</li>
  <li>34 GPIO, ADC 12 бит, DAC, I2C, SPI, UART</li>
  <li>Цена $5-8</li>
</ul>
<h3>Первое подключение к Wi-Fi</h3>
<pre><code>#include &lt;WiFi.h&gt;

const char* ssid = "MyHomeWiFi";
const char* password = "secret123";

void setup() {
    Serial.begin(115200);
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("\\nConnected! IP: " + WiFi.localIP().toString());
}</code></pre>
<h3>Отправка данных в ThingSpeak</h3>
<p>ThingSpeak — бесплатный облачный сервис для IoT. Графики, агрегация, API.</p>
<pre><code>#include &lt;HTTPClient.h&gt;

void sendToThingSpeak(float temp, float humidity) {
    if (WiFi.status() != WL_CONNECTED) return;
    HTTPClient http;
    String url = "https://api.thingspeak.com/update?api_key=YOUR_KEY";
    url += "&field1=" + String(temp);
    url += "&field2=" + String(humidity);
    http.begin(url);
    int code = http.GET();
    Serial.println("HTTP " + String(code));
    http.end();
}</code></pre>
<h3>MQTT — более правильный путь</h3>
<p>Для серьёзного IoT используют MQTT (брокер сообщений). Это легче и эффективнее HTTP, особенно для устройств на батарейке.</p>
<pre><code>// Библиотека PubSubClient
client.connect("ESP32_Sensor");
client.publish("home/livingroom/temp", String(temp).c_str());</code></pre>
<div class="callout"><span>🔋</span><div>Для устройств на батарейке используйте Deep Sleep — ESP32 потребляет всего 10 мкА в этом режиме. Будите по таймеру или внешнему сигналу.</div></div>` },
        { id: 'l_ard_6', duration: 90, type: 'project', title: ml('Финальный проект: умная теплица','Қорытынды жоба: ақылды теплица','Final project: smart greenhouse'), content: `<h2>Финальный проект: умная теплица</h2>
<p>Полноценное IoT-устройство, которое автоматически следит за условиями в теплице и шлёт данные в облако. Реальный кейс — наши выпускники продают такие в агросектор КЗ за $80-150.</p>
<h3>Функциональность</h3>
<ul>
  <li>Измерение: температура воздуха, влажность воздуха, влажность почвы, освещённость</li>
  <li>Автоматический полив при влажности почвы &lt; 40%</li>
  <li>Включение вентилятора при температуре &gt; 30°C</li>
  <li>Включение лампы при освещённости &lt; 200 лк</li>
  <li>Отправка данных на дашборд каждые 5 минут</li>
  <li>SMS / Telegram уведомление при критических значениях</li>
</ul>
<h3>Компоненты</h3>
<ul>
  <li>ESP32 DevKit V1</li>
  <li>DHT22 — воздух</li>
  <li>Capacitive Soil Moisture v2 — почва</li>
  <li>BH1750 — люксметр</li>
  <li>4-канальный релейный модуль 5В</li>
  <li>Помпа 12В, вентилятор 12В, LED-фитолампа</li>
  <li>Блок питания 12В 3А</li>
  <li>DC-DC понижающий до 5В для ESP32</li>
</ul>
<h3>Архитектура</h3>
<pre><code>┌─────────────┐
│  Датчики    │──I2C/Digital──┐
└─────────────┘               │
                              ▼
                       ┌─────────────┐    Wi-Fi    ┌──────────┐
                       │   ESP32     │────────────▶│ MQTT     │
                       └─────────────┘             │ Broker   │
                              │                    └────┬─────┘
                              │ GPIO                     │
                              ▼                         ▼
                       ┌─────────────┐           ┌──────────┐
                       │   Реле x4   │           │ Grafana  │
                       └─────────────┘           └──────────┘</code></pre>
<h3>Что сдать</h3>
<ol>
  <li>Собранное устройство в корпусе (3D-печать или коробка)</li>
  <li>Прошивка с исходниками на GitHub</li>
  <li>Скриншоты Grafana дашборда</li>
  <li>2-минутное видео работы</li>
  <li>Презентация на 5 слайдов: проблема, решение, архитектура, демо, развитие</li>
</ol>
<div class="callout"><span>🌱</span><div>Этот проект засчитывается в портфолио и может использоваться как стартовая идея для участия в хакатонах AgroTech.</div></div>` },
      ],
    },

    // -------------------- STEM Hanym --------------------
    {
      id: 'c_hanym',
      slug: 'stem-hanym',
      categoryKey: 'cat.initiatives',
      levelKey: 'level.beginner',
      durationWeeks: 10,
      hours: 36,
      students: 1567,
      rating: 5.0,
      featured: true,
      cover: 'hanym',
      title: ml(
        'STEM Hanym: девушки в науке и технологиях',
        'STEM Hanym: қыздар ғылым мен технологияда',
        'STEM Hanym: Girls in Science and Technology'
      ),
      tagline: ml(
        'Программа для девочек 12-18 лет: STEM-карьера, наставничество, проекты',
        '12-18 жастағы қыздарға арналған бағдарлама: STEM мансабы, тәлімгерлік, жобалар',
        'Program for girls 12-18: STEM careers, mentorship, projects'
      ),
      description: ml(
        'STEM Hanym — флагманская инициатива USTEM Academy для поддержки девочек в науке и технологиях. Уникальная программа сочетает технические навыки (программирование, робототехника, дизайн), карьерное наставничество от женщин-лидеров IT и инженерии Казахстана, а также реальные проекты с социальной миссией.',
        'STEM Hanym — қыздарды ғылым мен технологияда қолдауға арналған USTEM Academy флагмандық бастамасы. Бірегей бағдарлама техникалық дағдыларды (бағдарламалау, робототехника, дизайн), Қазақстанның IT және инженерия әйел көшбасшыларынан мансаптық тәлімгерлікті және әлеуметтік миссиясы бар нақты жобаларды біріктіреді.',
        'STEM Hanym is USTEM Academys flagship initiative to support girls in science and technology. The unique program combines technical skills (programming, robotics, design), career mentorship from women leaders in Kazakhstani IT and engineering, and real projects with social impact.'
      ),
      objectives: [
        ml('Освоить базу программирования и робототехники',
           'Бағдарламалау мен робототехника негіздерін меңгеру',
           'Master programming and robotics basics'),
        ml('Получить личного ментора из IT-индустрии',
           'IT саласынан жеке тәлімгер табу',
           'Get a personal mentor from the IT industry'),
        ml('Реализовать социальный STEM-проект',
           'Әлеуметтік STEM жобасын іске асыру',
           'Implement a social STEM project'),
        ml('Подготовиться к поступлению в технические вузы',
           'Техникалық ЖОО-ға түсуге дайындалу',
           'Prepare for admission to technical universities'),
      ],
      instructor: {
        name: 'Жанар Мендыбаева',
        avatar: 'Ж',
        role: ml('Founder of STEM Hanym', 'STEM Hanym негізін қалаушы', 'Founder of STEM Hanym'),
        bio: ml(
          'CTO IT-компании, основательница STEM Hanym. Forbes Kazakhstan 30 Under 30 (2022). MIT alumna.',
          'IT-компанияның CTO-сы, STEM Hanym негізін қалаушы. Forbes Kazakhstan 30 Under 30 (2022). MIT түлегі.',
          'CTO of an IT company, founder of STEM Hanym. Forbes Kazakhstan 30 Under 30 (2022). MIT alumna.'
        ),
      },
      lessons: [
        { id: 'l_han_1', duration: 30, type: 'video', title: ml('Добро пожаловать в STEM Hanym','STEM Hanym-ға қош келдіңіз','Welcome to STEM Hanym'), content: `<h2>Что такое STEM Hanym</h2>
<p>STEM Hanym — это не просто курс. Это сообщество, наставничество и реальные возможности для девочек 12-18 лет, которые хотят попробовать себя в науке и технологиях.</p>
<h3>Миссия</h3>
<p>В Казахстане только ~22% выпускников IT-факультетов — девушки, хотя в школьном STEM они показывают результаты не хуже мальчиков. STEM Hanym помогает закрыть этот разрыв.</p>
<h3>Три кита программы</h3>
<ol>
  <li><strong>Технические знания</strong> — программирование, робототехника, дизайн</li>
  <li><strong>Менторство 1:1</strong> — каждая участница получает наставницу-практикантку из IT</li>
  <li><strong>Социальный проект</strong> — реальная задача с социальной миссией, которую вы решаете командой</li>
</ol>
<h3>Что даёт программа</h3>
<ul>
  <li>Знания и портфолио, чтобы поступить на STEM-специальности</li>
  <li>Сеть контактов: 70+ менторок из IT-компаний КЗ</li>
  <li>Сертификат USTEM Academy + STEM Hanym</li>
  <li>Топ участницы — стипендия на дальнейшее обучение</li>
</ul>
<h3>Истории выпускниц</h3>
<p>За 3 года программу прошли 1200+ девочек. Многие из них сейчас учатся в Назарбаев Университете, КИМЭП, КБТУ, или работают в стартапах.</p>
<div class="callout"><span>💜</span><div>Девиз STEM Hanym: «Ты не одна. Ты в сообществе. Ты способна.»</div></div>` },
        { id: 'l_han_2', duration: 40, type: 'video', title: ml('Истории успеха: женщины-лидеры IT КЗ','Табыс тарихтары: Қазақстан IT саласындағы әйел көшбасшылар','Success stories: women IT leaders of KZ'), content: `<h2>Они тоже когда-то начинали</h2>
<p>На этом уроке мы знакомимся с историями казахстанок, которые построили карьеру в науке и технологиях. У каждой свой путь — и почти у каждой был момент сомнения «а получится ли у меня».</p>
<h3>Динара Касенова — Co-founder fintech startup</h3>
<p>В 14 лет писала первый сайт на Notepad. В 18 — поступила в КБТУ на IT. В 25 — запустила первый стартап. В 32 — продала его за $4M. Сейчас инвестирует в женщин-основательниц.</p>
<h3>Айгерим Шорманова — Tech Lead at Bank</h3>
<p>«Я была единственной девушкой на курсе из 30 человек. Сначала боялась задавать вопросы. Потом поняла, что мои вопросы — лучшие. И стала ловить себя на мысли: я знаю больше, чем думаю.»</p>
<h3>Жанар Болатова — AI Researcher, ETH Zurich</h3>
<p>Из села под Шымкентом — в один из ведущих вузов мира. Сейчас публикует статьи по компьютерному зрению, работает над протезами руки на ИИ-управлении.</p>
<h3>Айдай Тургунбаева — Robotics Engineer, MIT</h3>
<p>Школа в Алматы → лицей KazNU → MIT. Готовила сборную Казахстана по робототехнике 5 лет. Сейчас работает над проектом Mars Rover в JPL.</p>
<h3>Что у них общего?</h3>
<ol>
  <li>В какой-то момент они начали с нуля и не сдались</li>
  <li>Они нашли менторов / сообщество</li>
  <li>Они говорили «да» возможностям, даже когда не были уверены</li>
  <li>Они верили в себя сильнее, чем сомневались</li>
</ol>
<div class="callout"><span>💪</span><div>«Ты не должна быть особенной, чтобы быть в STEM. STEM нужны разные люди — и твой голос тоже важен.»</div></div>` },
        { id: 'l_han_3', duration: 50, type: 'video', title: ml('Программирование: первые шаги','Бағдарламалау: алғашқы қадамдар','Programming: first steps'), content: `<h2>Знакомство с Python</h2>
<p>Python — самый дружелюбный к новичкам язык. Им пользуются для веба, ИИ, науки, автоматизации. И именно Python мы выбрали для первых шагов.</p>
<h3>Установка не нужна</h3>
<p>Для начала используем Google Colab — пишем код прямо в браузере, без установок.</p>
<h3>Hello, World</h3>
<pre><code>print("Привет, STEM Hanym!")
print("Это моя первая программа.")</code></pre>
<h3>Переменные и числа</h3>
<pre><code>name = "Айгерим"
age = 15
print(f"Меня зовут {name}, мне {age} лет.")

# Калькулятор
a = 12
b = 5
print(f"Сумма: {a + b}")      # 17
print(f"Разность: {a - b}")   # 7
print(f"Произведение: {a * b}") # 60
print(f"Деление: {a / b}")    # 2.4</code></pre>
<h3>Условия</h3>
<pre><code>grade = int(input("Твоя оценка: "))
if grade &gt;= 90:
    print("Отлично! 🎉")
elif grade &gt;= 70:
    print("Хорошо!")
else:
    print("Поработай ещё немного")</code></pre>
<h3>Циклы</h3>
<pre><code># Распечатать таблицу умножения
for i in range(1, 11):
    print(f"7 × {i} = {7 * i}")</code></pre>
<h3>Задание</h3>
<p>Напишите программу, которая спрашивает имя пользователя, его возраст, и говорит, в каком году он(а) родился(ась). Загрузите результат в Colab и поделитесь ссылкой с ментором.</p>
<div class="callout"><span>🐍</span><div>Если что-то не получается — это нормально. Программирование на 80% состоит из решения ошибок. Это не баг — это процесс обучения.</div></div>` },
        { id: 'l_han_4', duration: 45, type: 'video', title: ml('Дизайн-мышление для STEM-проектов','STEM жобалар үшін дизайн-ойлау','Design thinking for STEM projects'), content: `<h2>Дизайн-мышление: метод от Stanford</h2>
<p>Дизайн-мышление (Design Thinking) — это подход к решению задач, который ставит человека в центр. Вместо «у меня есть классная технология, как её применить?» он спрашивает «у кого есть проблема, и как я могу её решить?»</p>
<h3>Пять этапов</h3>
<ol>
  <li><strong>Empathize</strong> — глубоко понять пользователя через интервью, наблюдение</li>
  <li><strong>Define</strong> — сформулировать проблему как HMW («How might we...»)</li>
  <li><strong>Ideate</strong> — генерация идей без критики (brainstorm)</li>
  <li><strong>Prototype</strong> — быстро собрать черновую версию решения</li>
  <li><strong>Test</strong> — показать пользователям, собрать обратную связь, итерировать</li>
</ol>
<h3>Empathize: интервью</h3>
<p>Не спрашивайте: «Какое приложение вам нужно?» — люди не знают. Спрашивайте: «Расскажите про последний раз, когда вы делали X. Что было сложно?»</p>
<h3>Define: формулировка</h3>
<p>Шаблон HMW: «Как мы могли бы [действие] для [пользователя] чтобы [результат]?»</p>
<p>Пример: «Как мы могли бы помочь бабушкам в ауле получать рецепты от врача, если рядом нет аптеки?»</p>
<h3>Ideate: расходимся</h3>
<ul>
  <li>Целимся в количество (50 идей за 30 минут)</li>
  <li>Никакой критики на этом этапе</li>
  <li>Самые «дикие» идеи ценны — от них рождаются неожиданные решения</li>
  <li>Используйте стикеры, чтобы потом сортировать</li>
</ul>
<h3>Prototype: быстро и дёшево</h3>
<p>Прототип не обязан работать! Это может быть нарисованный на бумаге экран приложения. Главное — что-то, что можно показать и обсудить.</p>
<h3>Test: смирение</h3>
<p>Пользователи будут критиковать ваше решение. Это нормально и хорошо. Каждое замечание = улучшение в следующей итерации.</p>
<div class="callout"><span>🎨</span><div>Дизайн-мышление — это не только про дизайн интерфейсов. Это образ мышления, применимый к любой задаче: от стартапа до домашнего хозяйства.</div></div>` },
        { id: 'l_han_5', duration: 60, type: 'video', title: ml('Сессия с ментором','Тәлімгермен сессия','Mentor session'), content: `<h2>Первая встреча с менторкой</h2>
<p>В STEM Hanym каждая участница получает личную наставницу — действующую специалистку из IT, инженерии или науки. Это не учительница и не подруга — это профессиональный союзник на 6+ месяцев.</p>
<h3>Кто эти менторки?</h3>
<p>Наши менторки — инженерки и руководительницы из Beeline, Kaspi, Halyk, Forte, Astana Hub, Назарбаев Университета, Технопарка Almaty. Всего более 70 менторок.</p>
<h3>Как проходит первая встреча</h3>
<ol>
  <li><strong>Знакомство</strong> (10 мин) — расскажите о себе, своих интересах</li>
  <li><strong>Истории</strong> (15 мин) — менторка делится своей карьерой</li>
  <li><strong>Цели</strong> (15 мин) — что вы хотите достичь за программу</li>
  <li><strong>План</strong> (15 мин) — как будем работать, частота встреч</li>
  <li><strong>Домашка</strong> (5 мин) — конкретное действие до следующей встречи</li>
</ol>
<h3>Подготовка к встрече</h3>
<p>Перед встречей подумайте над вопросами:</p>
<ul>
  <li>Какая часть STEM меня больше всего привлекает?</li>
  <li>Чего я боюсь больше всего в выборе профессии?</li>
  <li>Какое решение я планирую через 1 год, через 3 года?</li>
  <li>Что я могу сделать прямо сейчас, чтобы продвинуться?</li>
</ul>
<h3>Этика менторинга</h3>
<ul>
  <li>Уважайте время менторки — приходите подготовленной</li>
  <li>Не бойтесь задавать «глупые» вопросы — нет глупых</li>
  <li>Будьте честны о трудностях</li>
  <li>Благодарите</li>
</ul>
<div class="callout"><span>🤝</span><div>Многие наши выпускницы продолжают общаться со своими менторками годами — и потом сами становятся менторками для следующих поколений.</div></div>` },
        { id: 'l_han_6', duration: 120, type: 'project', title: ml('Социальный проект: пилот','Әлеуметтік жоба: пилот','Social project: pilot'), content: `<h2>Социальный проект — твой первый продукт</h2>
<p>Финал программы — команда из 3-4 девочек реализует реальный проект с социальной миссией. Это не учебное задание — это что-то, что будет работать в реальном мире.</p>
<h3>Темы прошлых проектов</h3>
<ul>
  <li><strong>AyalSos</strong> — мобильное приложение для жертв домашнего насилия с тихим вызовом помощи</li>
  <li><strong>SchoolBot</strong> — Telegram-бот, который помогает школьницам из аулов решать задачи по физике/математике</li>
  <li><strong>Manaba</strong> — платформа для соединения девочек из глубинки с менторками из городов</li>
  <li><strong>EkoQazyna</strong> — система мониторинга качества воздуха в школьных кабинетах</li>
  <li><strong>Tildi</strong> — приложение для изучения казахского языка с AR-карточками</li>
</ul>
<h3>Этапы проекта</h3>
<ol>
  <li><strong>Week 1-2:</strong> Поиск проблемы (интервью, исследование)</li>
  <li><strong>Week 3:</strong> Формулировка решения (Define + Ideate)</li>
  <li><strong>Week 4-5:</strong> Прототип (бумага, Figma, Bubble.io, простой код)</li>
  <li><strong>Week 6-7:</strong> Тестирование с 5-10 пользователями</li>
  <li><strong>Week 8-9:</strong> Полировка и подготовка к защите</li>
  <li><strong>Week 10:</strong> Презентация проектов перед жюри и публикой</li>
</ol>
<h3>Жюри финала</h3>
<p>Представители IT-компаний, фондов, инвесторов. Лучшие 3 проекта получают:</p>
<ul>
  <li>Гранты на развитие $1000-3000</li>
  <li>Менторство на 6 месяцев</li>
  <li>Презентация на Astana Hub Demo Day</li>
</ul>
<h3>Критерии оценки</h3>
<ul>
  <li>Социальная значимость проблемы</li>
  <li>Качество исследования и интервью</li>
  <li>Работоспособность прототипа</li>
  <li>Презентация и аргументация</li>
  <li>План развития</li>
</ul>
<div class="callout"><span>💜</span><div>Помните: цель не «выиграть», цель — создать что-то, что решает реальную проблему. Победа — это бонус.</div></div>` },
      ],
    },

    // -------------------- LEGO Education --------------------
    {
      id: 'c_legoedu',
      slug: 'lego-education',
      categoryKey: 'cat.robotics',
      levelKey: 'level.beginner',
      durationWeeks: 8,
      hours: 24,
      students: 1923,
      rating: 4.8,
      featured: false,
      cover: 'legoedu',
      title: ml(
        'LEGO Education: SPIKE Prime и WeDo 2.0',
        'LEGO Education: SPIKE Prime және WeDo 2.0',
        'LEGO Education: SPIKE Prime & WeDo 2.0'
      ),
      tagline: ml(
        'Полный курс по образовательным наборам LEGO для детей и педагогов',
        'Балалар мен педагогтерге арналған LEGO білім беру жинақтарының толық курсы',
        'Complete course on LEGO educational kits for children and educators'
      ),
      description: ml(
        'Учебный курс охватывает три ключевых набора LEGO Education: WeDo 2.0 (для младших), SPIKE Essential (для средних) и SPIKE Prime (для старших). Идеален для учителей, готовящихся к преподаванию робототехники, и для родителей, желающих заниматься с детьми дома. Сертификат USTEM Academy + LEGO Education.',
        'Оқу курсы LEGO Education-тің үш негізгі жинағын қамтиды: WeDo 2.0 (кіші жасқа), SPIKE Essential (орта жасқа), SPIKE Prime (үлкен жасқа). Робототехниканы оқытуға дайындалып жатқан мұғалімдерге және балалармен үйде айналысқысы келетін ата-аналарға өте ыңғайлы.',
        'The course covers three key LEGO Education sets: WeDo 2.0 (for younger), SPIKE Essential (for middle), and SPIKE Prime (for older students). Ideal for teachers preparing to teach robotics and for parents wanting to work with children at home.'
      ),
      objectives: [
        ml('Работать с тремя поколениями LEGO Education', 'LEGO Education үш буынымен жұмыс істеу', 'Work with three generations of LEGO Education'),
        ml('Преподавать робототехнику детям 6-14 лет', '6-14 жастағы балаларға робототехниканы оқыту', 'Teach robotics to children aged 6-14'),
        ml('Создавать собственные образовательные сценарии', 'Өзіңіздің білім беру сценарийлеріңізді жасау', 'Create your own educational scenarios'),
        ml('Подготовить учеников к FLL Explore и Discover', 'Оқушыларды FLL Explore және Discover-ге дайындау', 'Prepare students for FLL Explore and Discover'),
      ],
      instructor: {
        name: 'Дина Бекмагамбетова',
        avatar: 'Д',
        role: ml('LEGO Education Certified Trainer', 'LEGO Education сертификатталған бапкері', 'LEGO Education Certified Trainer'),
        bio: ml(
          'Один из 12 сертифицированных LEGO Education тренеров в Центральной Азии. Обучила более 800 педагогов.',
          'Орталық Азиядағы 12 сертификатталған LEGO Education бапкерінің бірі. 800-ден астам педагогты оқытқан.',
          'One of only 12 certified LEGO Education trainers in Central Asia. Trained 800+ educators.'
        ),
      },
      lessons: [
        { id: 'l_le_1', duration: 30, type: 'video', title: ml('Экосистема LEGO Education','LEGO Education экожүйесі','LEGO Education ecosystem'), content: `<h2>LEGO Education: продуманная экосистема</h2>
<p>LEGO Education — это не игрушки. Это образовательные системы, прошедшие десятки лет совершенствования и используемые в школах по всему миру.</p>
<h3>Линейка по возрастам</h3>
<table style="width:100%;border-collapse:collapse;margin:1rem 0">
  <tr style="background:#f1f5f9"><th style="padding:8px;border:1px solid #e2e8f0">Набор</th><th style="padding:8px;border:1px solid #e2e8f0">Возраст</th><th style="padding:8px;border:1px solid #e2e8f0">Программирование</th><th style="padding:8px;border:1px solid #e2e8f0">Особенности</th></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0"><strong>DUPLO</strong></td><td style="padding:8px;border:1px solid #e2e8f0">2-5</td><td style="padding:8px;border:1px solid #e2e8f0">Нет</td><td style="padding:8px;border:1px solid #e2e8f0">Крупные детали, развитие моторики</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0"><strong>Coding Express</strong></td><td style="padding:8px;border:1px solid #e2e8f0">5-7</td><td style="padding:8px;border:1px solid #e2e8f0">Цветные блоки</td><td style="padding:8px;border:1px solid #e2e8f0">Поезд + кубики, дошкольники</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0"><strong>WeDo 2.0</strong></td><td style="padding:8px;border:1px solid #e2e8f0">7-10</td><td style="padding:8px;border:1px solid #e2e8f0">Drag-and-drop</td><td style="padding:8px;border:1px solid #e2e8f0">Bluetooth, начальная школа</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0"><strong>SPIKE Essential</strong></td><td style="padding:8px;border:1px solid #e2e8f0">8-11</td><td style="padding:8px;border:1px solid #e2e8f0">Word Blocks</td><td style="padding:8px;border:1px solid #e2e8f0">Сторителлинг, нарратив</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0"><strong>SPIKE Prime</strong></td><td style="padding:8px;border:1px solid #e2e8f0">10-14</td><td style="padding:8px;border:1px solid #e2e8f0">Scratch / Python</td><td style="padding:8px;border:1px solid #e2e8f0">FLL, серьёзная робототехника</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0"><strong>EV3 (устарел)</strong></td><td style="padding:8px;border:1px solid #e2e8f0">10-16</td><td style="padding:8px;border:1px solid #e2e8f0">EV3-G / Python</td><td style="padding:8px;border:1px solid #e2e8f0">Снят с производства в 2024</td></tr>
</table>
<h3>Что объединяет всю экосистему?</h3>
<ul>
  <li>Все детали совместимы с обычным LEGO Technic</li>
  <li>Общая методология «4C» — об этом дальше</li>
  <li>Готовые планы уроков для учителей</li>
  <li>Один аккаунт LEGO Education для всех платформ</li>
</ul>
<div class="callout"><span>🇰🇿</span><div>В Казахстане LEGO Education официально внедрён в более 800 школах с 2018 года через программу «Цифровой Казахстан».</div></div>` },
        { id: 'l_le_2', duration: 40, type: 'video', title: ml('WeDo 2.0: первые модели','WeDo 2.0: алғашқы модельдер','WeDo 2.0: first models'), content: `<h2>WeDo 2.0 — первое знакомство с робототехникой</h2>
<p>WeDo 2.0 — это набор для начальной школы (1-4 класс). Он специально упрощён: меньше деталей, понятный визуальный язык программирования, акцент на исследовательской работе.</p>
<h3>Состав набора</h3>
<ul>
  <li><strong>SmartHub</strong> — Bluetooth-контроллер с 2 портами</li>
  <li><strong>1 средний мотор</strong></li>
  <li><strong>1 датчик движения</strong> (ИК)</li>
  <li><strong>1 датчик наклона</strong></li>
  <li><strong>280 деталей</strong> LEGO Technic</li>
</ul>
<h3>Визуальный язык</h3>
<p>Программа собирается из иконок-блоков, расположенных слева направо. Это «программа-полоска», которую ребёнок видит как комикс.</p>
<h3>Готовые проекты в комплекте</h3>
<ol>
  <li><strong>Танцующий поезд</strong> — изучение тяги</li>
  <li><strong>Драгстер</strong> — скорость и шестерёнки</li>
  <li><strong>Метаморфоз лягушки</strong> — биология</li>
  <li><strong>Шторм-предупредитель</strong> — погода и сенсоры</li>
  <li><strong>Робот-исследователь</strong> — пространственное мышление</li>
</ol>
<h3>Методика для учителя</h3>
<p>Каждый урок WeDo построен по схеме 4C: Connect → Construct → Contemplate → Continue. Не пытайтесь дать ребёнку готовую инструкцию по сборке — пусть он сначала задастся вопросом «зачем это?»</p>
<h3>Пример урока: «Спасатель»</h3>
<ol>
  <li><strong>Connect</strong>: показать видео о спасателях, обсудить, какие у них трудности</li>
  <li><strong>Construct</strong>: построить робота-спасателя, который издаёт звук тревоги и мигает</li>
  <li><strong>Contemplate</strong>: тест работы, обсуждение что улучшить</li>
  <li><strong>Continue</strong>: усложнить — добавить датчик движения, чтобы тревога срабатывала автоматически</li>
</ol>
<div class="callout"><span>🚂</span><div>WeDo 2.0 — самый «защищённый от детей» из всей экосистемы. Прочные детали, простой код, безопасные моторы.</div></div>` },
        { id: 'l_le_3', duration: 50, type: 'video', title: ml('SPIKE Essential: переходный этап','SPIKE Essential: ауыспалы кезең','SPIKE Essential: transition stage'), content: `<h2>SPIKE Essential — мост между WeDo и Prime</h2>
<p>SPIKE Essential заполнил пробел между WeDo 2.0 и SPIKE Prime. Он рассчитан на 2-5 классы и делает акцент на сторителлинг — детям нравится придумывать истории через свои модели.</p>
<h3>Что нового по сравнению с WeDo</h3>
<ul>
  <li><strong>Двухмоторный хаб</strong> с 5×5 LED-матрицей</li>
  <li><strong>3 порта</strong> вместо 2 у WeDo</li>
  <li><strong>Лучшая совместимость</strong> с обычным LEGO</li>
  <li><strong>Микрофон</strong> в хабе — реагирует на звук</li>
  <li><strong>Минифигурки</strong> Maria, Daniel, Sofie, Leo — герои историй</li>
</ul>
<h3>Word Blocks — следующий шаг</h3>
<p>В отличие от WeDo, программа в SPIKE Essential похожа на «текстовое предложение»:</p>
<pre><code>Когда программа запускается:
    Включить мотор A со скоростью 50%
    Подождать 2 секунды
    Если датчик нажат, то:
        Воспроизвести звук "Smile"</code></pre>
<p>Это подготовка к Scratch и Python — дети видят знакомую логику.</p>
<h3>Сюжетные уроки</h3>
<p>SPIKE Essential построен вокруг 4 героев и их приключений. Каждый урок — это глава в истории:</p>
<ul>
  <li>«Maria и потерянная собака»</li>
  <li>«Daniel изобретает машину»</li>
  <li>«Sofie исследует пещеру»</li>
  <li>«Leo строит дом»</li>
</ul>
<p>Дети не «делают робота» — они «помогают герою решить проблему».</p>
<h3>Связь со школьным программированием</h3>
<p>SPIKE Essential официально интегрирован с учебной программой по информатике 3-4 классов в нескольких регионах Казахстана через программу «STEM в школу».</p>
<div class="callout"><span>👩‍🏫</span><div>SPIKE Essential — лучший выбор для учителей младших классов. Минимум подготовки, максимум вовлечённости детей.</div></div>` },
        { id: 'l_le_4', duration: 60, type: 'video', title: ml('SPIKE Prime: продвинутый уровень','SPIKE Prime: жетілдірілген деңгей','SPIKE Prime: advanced level'), content: `<h2>SPIKE Prime — серьёзная робототехника</h2>
<p>SPIKE Prime — флагман LEGO Education. Это тот самый набор, на котором соревнуются команды FLL по всему миру.</p>
<h3>Технические характеристики</h3>
<ul>
  <li><strong>Hub</strong> с 6 портами, ARM Cortex-M4, Bluetooth 5.0, 5×5 RGB матрица</li>
  <li><strong>2 больших мотора</strong> с энкодерами (360°/градус)</li>
  <li><strong>1 средний мотор</strong> для манипуляторов</li>
  <li><strong>Датчики</strong>: цвет, расстояние (ToF), сила</li>
  <li><strong>500+ деталей</strong> LEGO Technic</li>
</ul>
<h3>Два режима программирования</h3>
<p>В одном проекте можно использовать оба режима, переключаясь между ними:</p>
<h4>Scratch (Word Blocks)</h4>
<pre><code>Когда программа запускается
    Поехать на 50 см со скоростью 60%
    Когда расстояние &lt; 10 см
        Остановиться
        Развернуться на 180°</code></pre>
<h4>Python</h4>
<pre><code>from spike import PrimeHub, Motor, MotorPair, DistanceSensor
from spike.control import wait_for_seconds

hub = PrimeHub()
pair = MotorPair('A', 'B')
ds = DistanceSensor('C')

pair.move(50, 'cm', steering=0, speed=60)
while ds.get_distance_cm() &gt; 10:
    pair.start(speed=60)
pair.stop()
pair.move(180, 'degrees', steering=100, speed=40)</code></pre>
<h3>FLL — главное применение</h3>
<p>SPIKE Prime — официальная платформа FIRST LEGO League. На нём построено 80% команд-победителей последних лет.</p>
<h3>Темы для учителя</h3>
<ul>
  <li>Программирование с переменными и условиями</li>
  <li>Точная навигация с энкодерами</li>
  <li>Использование сенсоров для обратной связи</li>
  <li>Алгоритмы (PID, поиск пути)</li>
  <li>Командная работа над проектом</li>
</ul>
<div class="callout"><span>🏆</span><div>SPIKE Prime — мост между «школьной» и «настоящей» робототехникой. Освоив его, ученики легко переходят к Arduino, ROS и FTC.</div></div>` },
        { id: 'l_le_5', duration: 45, type: 'video', title: ml('Методика преподавания','Оқыту әдістемесі','Teaching methodology'), content: `<h2>Методика 4C от LEGO Education</h2>
<p>Все занятия в экосистеме LEGO Education построены по единой методологии «4C». Это не случайно — она основана на конструктивизме Сеймура Пейперта (ученика Пиаже) и десятилетиях исследований.</p>
<h3>Connect (Подключение) — 5-10 минут</h3>
<p>Цель: вызвать интерес и привязать новый материал к опыту ребёнка.</p>
<ul>
  <li>Покажите видео, картинку, реальный объект</li>
  <li>Задайте вопрос «А вы знаете, как...»</li>
  <li>Расскажите историю — «На прошлой неделе в Турции...»</li>
</ul>
<p><em>Пример:</em> Перед уроком «Метаморфоз лягушки» покажите видео головастика, превращающегося в лягушку.</p>
<h3>Construct (Конструирование) — 25-35 минут</h3>
<p>Цель: дети строят и программируют — это основная часть урока.</p>
<ul>
  <li>Не давайте готовую инструкцию сразу — пусть подумают</li>
  <li>Поощряйте эксперименты</li>
  <li>Ходите между парами, задавайте вопросы, не давайте ответы</li>
  <li>Принимайте «неправильные» решения — они тоже учат</li>
</ul>
<h3>Contemplate (Осмысление) — 10-15 минут</h3>
<p>Цель: ребёнок объясняет, что он сделал и почему.</p>
<ul>
  <li>«Покажи, что получилось»</li>
  <li>«Что было сложно?»</li>
  <li>«Что бы ты изменил?»</li>
  <li>«Где ещё это можно применить?»</li>
</ul>
<p>Это самый важный этап для глубокого обучения. Не пропускайте его из-за нехватки времени.</p>
<h3>Continue (Продолжение) — 5-10 минут</h3>
<p>Цель: расширение знаний и применение к новой ситуации.</p>
<ul>
  <li>«А что если усложнить?»</li>
  <li>«А что если использовать другой датчик?»</li>
  <li>«Как это применить в реальной жизни?»</li>
</ul>
<p>Continue — это домашнее задание (если есть) или подведение мостика к следующему уроку.</p>
<h3>Роль учителя в 4C</h3>
<p>Учитель не лектор. Учитель — фасилитатор. Его задача:</p>
<ul>
  <li>Задавать правильные вопросы</li>
  <li>Создавать безопасную среду для ошибок</li>
  <li>Замечать прогресс каждого ребёнка</li>
  <li>Не торопить</li>
</ul>
<div class="callout"><span>🎓</span><div>Освоив 4C, вы получите официальную сертификацию LEGO Education Trainer — это даёт право проводить курсы в школах и получать роялти.</div></div>` },
      ],
    },

    // -------------------- ROS --------------------
    {
      id: 'c_ros',
      slug: 'ros-robot-operating-system',
      categoryKey: 'cat.robotics',
      levelKey: 'level.advanced',
      durationWeeks: 12,
      hours: 56,
      students: 487,
      rating: 4.7,
      featured: false,
      cover: 'ros',
      title: ml(
        'ROS 2: операционная система для роботов',
        'ROS 2: роботтарға арналған операциялық жүйе',
        'ROS 2: Robot Operating System'
      ),
      tagline: ml(
        'Профессиональный стандарт индустрии — от Boston Dynamics до NASA',
        'Индустрияның кәсіби стандарты — Boston Dynamics-тен NASA-ға дейін',
        'Industry professional standard — from Boston Dynamics to NASA'
      ),
      description: ml(
        'ROS (Robot Operating System) — фактический стандарт разработки роботов в индустрии и исследованиях. Курс посвящён ROS 2 Humble. Изучаем архитектуру nodes/topics/services, работаем с симулятором Gazebo, реализуем навигацию (Nav2), SLAM и манипуляцию (MoveIt). Подходит инженерам с опытом в Python или C++.',
        'ROS (Robot Operating System) — индустриядағы және зерттеулердегі роботтарды әзірлеудің нақты стандарты. Курс ROS 2 Humble-ге арналған. Nodes/topics/services архитектурасын зерттеп, Gazebo симуляторымен жұмыс істейміз, навигация (Nav2), SLAM және манипуляция (MoveIt) іске асырамыз.',
        'ROS (Robot Operating System) is the de facto standard for robot development in industry and research. The course focuses on ROS 2 Humble. We study the nodes/topics/services architecture, work with the Gazebo simulator, implement navigation (Nav2), SLAM, and manipulation (MoveIt). Suitable for engineers with Python or C++ experience.'
      ),
      objectives: [
        ml('Создавать собственные ROS 2 пакеты', 'Өзіңіздің ROS 2 пакеттеріңізді жасау', 'Create your own ROS 2 packages'),
        ml('Использовать Gazebo для симуляции', 'Симуляция үшін Gazebo қолдану', 'Use Gazebo for simulation'),
        ml('Настраивать SLAM и навигацию (Nav2)', 'SLAM және навигацияны (Nav2) баптау', 'Configure SLAM and navigation (Nav2)'),
        ml('Программировать манипуляторы через MoveIt', 'Манипуляторларды MoveIt арқылы бағдарламалау', 'Program manipulators with MoveIt'),
        ml('Интегрировать перцепцию: камеры, LIDAR', 'Перцепция интеграциясы: камералар, LIDAR', 'Integrate perception: cameras, LIDAR'),
      ],
      instructor: {
        name: 'Канат Жумагулов',
        avatar: 'К',
        role: ml('Robotics Software Engineer', 'Робототехника бағдарламалық жасақтама инженері', 'Robotics Software Engineer'),
        bio: ml(
          'ROS-разработчик с 9-летним опытом. Работал в стартапах беспилотного транспорта в Сан-Франциско и Сеуле.',
          '9 жылдық тәжірибесі бар ROS әзірлеушісі. Сан-Францискодағы және Сеулдағы пилотсыз көлік стартаптарында жұмыс істеген.',
          'ROS developer with 9 years of experience. Worked at autonomous vehicle startups in San Francisco and Seoul.'
        ),
      },
      lessons: [
        { id: 'l_ros_1', duration: 40, type: 'video', title: ml('Что такое ROS и зачем он нужен','ROS деген не және ол не үшін қажет','What is ROS and why you need it'), content: `<h2>ROS: общий язык робототехники</h2>
<p>ROS (Robot Operating System) — это не операционная система в привычном смысле. Это набор библиотек, инструментов и соглашений, которые позволяют разным компонентам робота общаться между собой.</p>
<h3>Зачем нужен ROS</h3>
<p>Представьте: вы пишете робота с нуля. Вам нужно:</p>
<ul>
  <li>Читать LIDAR</li>
  <li>Обрабатывать видео с камеры</li>
  <li>Строить карту</li>
  <li>Планировать путь</li>
  <li>Управлять моторами</li>
  <li>Логировать данные</li>
  <li>Принимать команды по сети</li>
</ul>
<p>Без ROS вам пришлось бы писать всё это самому. С ROS — берёте готовые «ноды» от сообщества и собираете робота как Lego.</p>
<h3>Кто использует ROS</h3>
<ul>
  <li><strong>Boston Dynamics</strong> — Spot частично использует ROS-совместимые компоненты</li>
  <li><strong>NASA</strong> — Mars rovers</li>
  <li><strong>Toyota Research Institute</strong> — автономные авто</li>
  <li><strong>Amazon</strong> — складские роботы Kiva</li>
  <li><strong>Тысячи стартапов и исследовательских лабораторий</strong></li>
</ul>
<h3>ROS 1 vs ROS 2</h3>
<table style="width:100%;border-collapse:collapse;margin:1rem 0">
  <tr style="background:#f1f5f9"><th style="padding:8px;border:1px solid #e2e8f0">Аспект</th><th style="padding:8px;border:1px solid #e2e8f0">ROS 1</th><th style="padding:8px;border:1px solid #e2e8f0">ROS 2</th></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0">Год</td><td style="padding:8px;border:1px solid #e2e8f0">2007</td><td style="padding:8px;border:1px solid #e2e8f0">2017+</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0">Middleware</td><td style="padding:8px;border:1px solid #e2e8f0">Свой</td><td style="padding:8px;border:1px solid #e2e8f0">DDS (стандарт)</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0">Real-time</td><td style="padding:8px;border:1px solid #e2e8f0">Нет</td><td style="padding:8px;border:1px solid #e2e8f0">Да</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0">Master node</td><td style="padding:8px;border:1px solid #e2e8f0">Нужен</td><td style="padding:8px;border:1px solid #e2e8f0">Не нужен</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0">Платформы</td><td style="padding:8px;border:1px solid #e2e8f0">Ubuntu only</td><td style="padding:8px;border:1px solid #e2e8f0">Linux, Win, macOS</td></tr>
</table>
<h3>Текущий LTS</h3>
<p>В 2026 году актуальный LTS — <strong>ROS 2 Jazzy Jalisco</strong> (вышел в мае 2024). Поддержка до 2029. Если в проекте указан ROS 1 — это легаси, лучше переходить на ROS 2.</p>
<div class="callout"><span>🌐</span><div>Если вы хотите работать в робототехнике профессионально, ROS — обязательный навык. Это упоминается в 90% вакансий уровня senior.</div></div>` },
        { id: 'l_ros_2', duration: 50, type: 'video', title: ml('Установка ROS 2 Humble','ROS 2 Humble орнату','Installing ROS 2 Humble'), content: `<h2>Установка ROS 2 на Ubuntu 22.04</h2>
<p>Курс работает с ROS 2 Humble Hawksbill — LTS-релиз с поддержкой до 2027. Установка делается через apt.</p>
<h3>Подготовка системы</h3>
<pre><code>sudo apt update &amp;&amp; sudo apt upgrade -y
sudo apt install -y software-properties-common curl
sudo add-apt-repository universe</code></pre>
<h3>Добавление GPG ключа</h3>
<pre><code>sudo curl -sSL https://raw.githubusercontent.com/ros/rosdistro/master/ros.key \\
    -o /usr/share/keyrings/ros-archive-keyring.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/ros-archive-keyring.gpg] \\
http://packages.ros.org/ros2/ubuntu $(. /etc/os-release &amp;&amp; echo $UBUNTU_CODENAME) main" | \\
    sudo tee /etc/apt/sources.list.d/ros2.list</code></pre>
<h3>Установка</h3>
<pre><code>sudo apt update
sudo apt install -y ros-humble-desktop python3-colcon-common-extensions \\
    python3-rosdep python3-vcstool
sudo rosdep init
rosdep update</code></pre>
<h3>Настройка окружения</h3>
<pre><code># Добавить в ~/.bashrc:
source /opt/ros/humble/setup.bash
export ROS_DOMAIN_ID=0  # 0-101, для изоляции от других ROS-сетей</code></pre>
<h3>Проверка установки</h3>
<pre><code># Терминал 1
ros2 run demo_nodes_cpp talker

# Терминал 2
ros2 run demo_nodes_py listener</code></pre>
<p>Если в терминале 2 видите сообщения «Hello World» — всё работает.</p>
<h3>Рабочее пространство</h3>
<pre><code>mkdir -p ~/ros2_ws/src
cd ~/ros2_ws
colcon build --symlink-install
source install/setup.bash</code></pre>
<h3>Полезные команды</h3>
<ul>
  <li><code>ros2 node list</code> — все запущенные ноды</li>
  <li><code>ros2 topic list</code> — все активные топики</li>
  <li><code>ros2 topic echo /name</code> — слушать топик</li>
  <li><code>ros2 service list</code> — сервисы</li>
  <li><code>ros2 doctor</code> — диагностика установки</li>
</ul>
<div class="callout"><span>🐧</span><div>Если используете Windows или macOS — рекомендуем поставить Ubuntu в VirtualBox или WSL2. ROS 2 на Linux всё ещё стабильнее.</div></div>` },
        { id: 'l_ros_3', duration: 60, type: 'video', title: ml('Nodes, Topics, Services, Actions','Nodes, Topics, Services, Actions','Nodes, Topics, Services, Actions'), content: `<h2>Архитектура ROS 2</h2>
<p>ROS 2 строится на 4 базовых концепциях. Понимание их — 80% работы с ROS.</p>
<h3>1. Nodes (Узлы)</h3>
<p>Нода — это отдельный процесс, выполняющий одну задачу. Робот обычно состоит из десятков нод: одна читает камеру, другая обрабатывает изображение, третья управляет моторами.</p>
<pre><code>import rclpy
from rclpy.node import Node

class MyNode(Node):
    def __init__(self):
        super().__init__('my_node')
        self.get_logger().info('Started!')

def main():
    rclpy.init()
    rclpy.spin(MyNode())
    rclpy.shutdown()</code></pre>
<h3>2. Topics (Топики)</h3>
<p>Топик — это «канал» для постоянного потока сообщений. Издатели публикуют, подписчики слушают. Pub/Sub паттерн.</p>
<pre><code>from std_msgs.msg import String

# Publisher
self.pub = self.create_publisher(String, '/chatter', 10)
msg = String()
msg.data = 'Hello'
self.pub.publish(msg)

# Subscriber
self.sub = self.create_subscription(
    String, '/chatter', self.callback, 10)

def callback(self, msg):
    self.get_logger().info(f'Got: {msg.data}')</code></pre>
<p><strong>Примеры топиков робота:</strong> <code>/scan</code> (LIDAR), <code>/cmd_vel</code> (управление), <code>/odom</code> (одометрия), <code>/image_raw</code> (камера).</p>
<h3>3. Services (Сервисы)</h3>
<p>Сервис — это синхронный запрос-ответ. Используется для команд, на которые нужен ответ: «вычислить путь», «сохранить карту».</p>
<pre><code>from example_interfaces.srv import AddTwoInts

self.srv = self.create_service(
    AddTwoInts, 'add', self.handle)

def handle(self, request, response):
    response.sum = request.a + request.b
    return response</code></pre>
<h3>4. Actions (Действия)</h3>
<p>Действие — это долгая операция с обратной связью. «Поехать в точку X» — это часы пути, в течение которого нужны промежуточные обновления.</p>
<ul>
  <li>Goal — отправка цели</li>
  <li>Feedback — периодические апдейты</li>
  <li>Result — итоговый результат</li>
</ul>
<h3>Пакеты</h3>
<p>Нода живёт внутри пакета (package). Создание:</p>
<pre><code>cd ~/ros2_ws/src
ros2 pkg create --build-type ament_python my_robot
# Редактируем package.xml, setup.py, добавляем ноды в my_robot/
cd ~/ros2_ws &amp;&amp; colcon build --packages-select my_robot</code></pre>
<div class="callout"><span>🧩</span><div>Топики — для непрерывных потоков. Сервисы — для быстрых запросов. Действия — для долгих задач. Не путайте.</div></div>` },
        { id: 'l_ros_4', duration: 70, type: 'video', title: ml('Gazebo и симуляция','Gazebo және симуляция','Gazebo and simulation'), content: `<h2>Gazebo: симулятор робота</h2>
<p>Gazebo — это физический симулятор. Он рендерит реалистичную сцену с физикой (гравитация, трение, столкновения) и позволяет «прогнать» робота без реального железа.</p>
<h3>Почему симуляция важна</h3>
<ul>
  <li>Дешевле — не нужны компоненты для каждого студента</li>
  <li>Безопаснее — не сломаете дорогой LIDAR</li>
  <li>Воспроизводимо — одинаковая сцена для всех тестов</li>
  <li>Можно ускорить время в 10× для длительных тестов</li>
  <li>Параллельно — запустите 100 экспериментов одновременно для RL</li>
</ul>
<h3>Версии Gazebo</h3>
<p>Gazebo Classic — старый, идёт с ROS 2 Humble по умолчанию. Gazebo (Ignition) — современный, рекомендован для новых проектов. В этом уроке используем Gazebo Classic.</p>
<h3>Установка</h3>
<pre><code>sudo apt install -y ros-humble-gazebo-ros-pkgs \\
    ros-humble-turtlebot3 ros-humble-turtlebot3-simulations</code></pre>
<h3>Первый запуск TurtleBot3</h3>
<pre><code>export TURTLEBOT3_MODEL=burger
source /opt/ros/humble/setup.bash
source /usr/share/gazebo/setup.sh

ros2 launch turtlebot3_gazebo turtlebot3_world.launch.py</code></pre>
<p>Откроется окно Gazebo с роботом на лабиринтоподобном поле.</p>
<h3>Управление с клавиатуры</h3>
<pre><code># В другом терминале
ros2 run turtlebot3_teleop teleop_keyboard
# WASD для движения</code></pre>
<h3>Что под капотом</h3>
<p>Gazebo читает <code>.urdf</code> или <code>.sdf</code> файл — это XML-описание робота: размеры, моторы, датчики, физические свойства.</p>
<pre><code>&lt;link name="base_link"&gt;
  &lt;collision&gt;...&lt;/collision&gt;
  &lt;visual&gt;
    &lt;geometry&gt;
      &lt;mesh filename="robot.dae"/&gt;
    &lt;/geometry&gt;
  &lt;/visual&gt;
  &lt;inertial&gt;
    &lt;mass value="2.5"/&gt;
    &lt;inertia ixx="0.01" .../&gt;
  &lt;/inertial&gt;
&lt;/link&gt;</code></pre>
<h3>Топики симулированного робота</h3>
<p>В симуляции робот публикует те же топики, что и реальный:</p>
<ul>
  <li><code>/scan</code> — симулированный LIDAR</li>
  <li><code>/camera/image_raw</code> — симулированная камера</li>
  <li><code>/cmd_vel</code> — управление</li>
</ul>
<p>Это значит: код, написанный для симуляции, заработает на реальном роботе с минимальными правками.</p>
<div class="callout"><span>🎮</span><div>Принцип индустрии: 80% разработки робота — в симуляции, 20% — на железе. Это сильно экономит время и деньги.</div></div>` },
        { id: 'l_ros_5', duration: 80, type: 'video', title: ml('SLAM и навигация Nav2','SLAM және Nav2 навигациясы','SLAM and Nav2 navigation'), content: `<h2>SLAM и Nav2 — стандарт навигации</h2>
<p>SLAM Toolbox строит карту. Nav2 использует эту карту для перемещения робота из точки A в точку B. Это два самых важных стека ROS 2.</p>
<h3>Шаг 1: Картирование с SLAM Toolbox</h3>
<pre><code># Запустить робота в Gazebo
ros2 launch turtlebot3_gazebo turtlebot3_world.launch.py

# Запустить SLAM
ros2 launch slam_toolbox online_async_launch.py

# Запустить визуализацию
ros2 launch turtlebot3_navigation2 rviz2.launch.py

# Управлять роботом телеопом — катать его по всей карте</code></pre>
<p>На экране в RViz вы увидите, как заполняется карта по мере движения робота.</p>
<h3>Сохранение карты</h3>
<pre><code>ros2 run nav2_map_server map_saver_cli -f ~/my_map
# Создаёт my_map.yaml и my_map.pgm</code></pre>
<h3>Шаг 2: Навигация по сохранённой карте</h3>
<pre><code>ros2 launch nav2_bringup bringup_launch.py \\
    map:=$HOME/my_map.yaml use_sim_time:=true</code></pre>
<p>В RViz нажмите «2D Pose Estimate» — укажите начальное положение робота. Затем «Nav2 Goal» — кликните цель. Робот построит путь и поедет.</p>
<h3>Что внутри Nav2</h3>
<p>Nav2 — это behavior tree, который координирует:</p>
<ul>
  <li><strong>Global planner</strong> (NavFn, Smac) — строит общий путь по карте</li>
  <li><strong>Local planner</strong> (DWB, MPPI) — реагирует на динамические препятствия</li>
  <li><strong>Controller</strong> — преобразует план в команды моторов</li>
  <li><strong>Recovery behaviors</strong> — что делать при застревании</li>
  <li><strong>Costmap</strong> — слой опасности вокруг препятствий</li>
</ul>
<h3>Программное задание цели</h3>
<pre><code>from nav2_simple_commander.robot_navigator import BasicNavigator
from geometry_msgs.msg import PoseStamped

nav = BasicNavigator()
nav.waitUntilNav2Active()

goal = PoseStamped()
goal.header.frame_id = 'map'
goal.pose.position.x = 2.5
goal.pose.position.y = 1.5
goal.pose.orientation.w = 1.0

nav.goToPose(goal)
while not nav.isTaskComplete():
    feedback = nav.getFeedback()
    if feedback:
        print(f'ETA: {feedback.estimated_time_remaining.sec}s')</code></pre>
<h3>AMCL — локализация без SLAM</h3>
<p>Когда карта готова, переключаемся с SLAM на AMCL. SLAM требует ресурсов, AMCL легче. AMCL использует фильтр частиц для постоянной оценки позиции по сканам LIDAR.</p>
<div class="callout"><span>🗺</span><div>Nav2 — это уровень индустрии. Используя его, вы пишете код, который применим в реальных продуктах: складских роботах, доставщиках, уборщиках.</div></div>` },
        { id: 'l_ros_6', duration: 65, type: 'video', title: ml('MoveIt: манипуляторы','MoveIt: манипуляторлар','MoveIt: manipulators'), content: `<h2>MoveIt 2 — манипуляторы и руки</h2>
<p>Если Nav2 — это стандарт для мобильных роботов, то MoveIt 2 — стандарт для рук и манипуляторов. Если робот должен что-то «взять, переставить, повернуть» — это MoveIt.</p>
<h3>Что умеет MoveIt 2</h3>
<ul>
  <li><strong>Прямая кинематика (FK)</strong> — где будет конец руки при заданных углах суставов</li>
  <li><strong>Обратная кинематика (IK)</strong> — какие углы суставов нужны, чтобы конец оказался в точке X</li>
  <li><strong>Планирование траектории</strong> — RRT, PRM, CHOMP алгоритмы</li>
  <li><strong>Обход препятствий</strong> — рука облетает столы, людей, другие объекты</li>
  <li><strong>Контроль захвата</strong> — координация с gripper</li>
</ul>
<h3>Базовая концепция</h3>
<p>Манипулятор описывается через kinematic chain: цепочка суставов от base_link до end_effector. Каждый сустав — это revolute (поворотный) или prismatic (линейный).</p>
<h3>MoveIt Setup Assistant</h3>
<p>Графический инструмент для настройки манипулятора. Импортируете URDF — он автоматически создаёт SRDF, конфиги планировщиков, ограничения.</p>
<pre><code>ros2 launch moveit_setup_assistant setup_assistant.launch.py</code></pre>
<h3>Программирование движения</h3>
<pre><code>#include &lt;moveit/move_group_interface/move_group_interface.h&gt;

auto move_group = MoveGroupInterface(node, "arm");

// Установить целевую позу
geometry_msgs::Pose target;
target.position.x = 0.3;
target.position.y = 0.2;
target.position.z = 0.5;
target.orientation.w = 1.0;
move_group.setPoseTarget(target);

// Планировать
moveit::planning_interface::MoveGroupInterface::Plan plan;
auto result = move_group.plan(plan);

if (result == moveit::core::MoveItErrorCode::SUCCESS) {
    move_group.execute(plan);
}</code></pre>
<h3>Pick &amp; Place — типовая задача</h3>
<ol>
  <li>Определить позицию объекта (через камеру или известную)</li>
  <li>Открыть gripper</li>
  <li>Двигаться к approach позе (10 см над объектом)</li>
  <li>Опуститься к объекту</li>
  <li>Закрыть gripper</li>
  <li>Подняться</li>
  <li>Двигаться к точке назначения</li>
  <li>Открыть gripper</li>
</ol>
<h3>Популярные манипуляторы</h3>
<ul>
  <li><strong>UR5e/UR10e</strong> — коллаборативные, индустриальный стандарт</li>
  <li><strong>Franka Panda</strong> — научный, 7 DOF</li>
  <li><strong>Kinova Gen3</strong> — компактный, для образования</li>
  <li><strong>ROS-Industrial роботы</strong> — KUKA, ABB, Fanuc</li>
</ul>
<div class="callout"><span>🦾</span><div>MoveIt — это многомесячная тема. В этом курсе мы научимся базовому Pick &amp; Place в симуляции с виртуальной рукой.</div></div>` },
        { id: 'l_ros_7', duration: 120, type: 'project', title: ml('Финальный проект: автономный робот','Қорытынды жоба: автономды робот','Final project: autonomous robot'), content: `<h2>Финальный проект: робот-доставщик</h2>
<p>Соберём всё, что изучили, в один проект: робот ездит по симулированному офису, забирает «посылки» в одной комнате и доставляет в другую. Полностью автономно.</p>
<h3>Среда</h3>
<p>Используем готовую симуляцию офиса AWS RoboMaker — три комнаты, мебель, узкие проходы. Это близко к реальной задаче доставки внутри здания.</p>
<h3>Архитектура решения</h3>
<pre><code>┌─────────────────┐
│  Mission Node   │ ◀── состояние «жду заказ» / «еду за посылкой» / «доставляю»
└────────┬────────┘
         │ Goal
         ▼
┌─────────────────┐
│  Nav2 Stack     │ ◀── путь от текущей позиции к цели
└────────┬────────┘
         │ /cmd_vel
         ▼
┌─────────────────┐
│ Controller +    │
│ Robot (Gazebo)  │
└─────────────────┘

         ▲
         │ /scan, /odom, /tf
         │
┌─────────────────┐
│ SLAM/AMCL +     │
│ Sensors         │
└─────────────────┘</code></pre>
<h3>Этапы выполнения</h3>
<ol>
  <li><strong>День 1:</strong> Установка среды AWS RoboMaker, проверка симуляции</li>
  <li><strong>День 2:</strong> Картирование с SLAM Toolbox, сохранение карты</li>
  <li><strong>День 3:</strong> Настройка Nav2 на сохранённой карте</li>
  <li><strong>День 4:</strong> Написание Mission Node (state machine)</li>
  <li><strong>День 5:</strong> Тестирование, отладка, демо-видео</li>
</ol>
<h3>Mission Node — пример</h3>
<pre><code>class DeliveryRobot(Node):
    def __init__(self):
        super().__init__('delivery_robot')
        self.nav = BasicNavigator()
        self.state = 'WAIT'
        self.timer = self.create_timer(1.0, self.tick)

    def tick(self):
        if self.state == 'WAIT':
            if self.has_order():
                self.go_to(self.pickup_pose)
                self.state = 'GO_PICKUP'

        elif self.state == 'GO_PICKUP':
            if self.nav.isTaskComplete():
                self.simulate_pickup()
                self.go_to(self.dropoff_pose)
                self.state = 'DELIVERING'

        elif self.state == 'DELIVERING':
            if self.nav.isTaskComplete():
                self.simulate_dropoff()
                self.go_to(self.home_pose)
                self.state = 'RETURNING'

        elif self.state == 'RETURNING':
            if self.nav.isTaskComplete():
                self.state = 'WAIT'</code></pre>
<h3>Критерии оценки</h3>
<ul>
  <li>Робот успешно выполняет 5 циклов доставки подряд</li>
  <li>Время цикла &lt; 2 минут</li>
  <li>Никаких столкновений с препятствиями</li>
  <li>Чистая архитектура с разделением на ноды</li>
  <li>README с инструкцией запуска</li>
  <li>Демо-видео 2 минуты</li>
</ul>
<h3>Бонусы</h3>
<ul>
  <li>+ Распознавание QR-кодов на стенах для подтверждения комнаты</li>
  <li>+ Web-интерфейс для отправки заказа</li>
  <li>+ Несколько роботов работают одновременно</li>
  <li>+ Запуск на реальном TurtleBot3 в лаборатории академии</li>
</ul>
<div class="callout"><span>🎓</span><div>Этот проект — отличная начинка портфолио для поступления в магистратуру по робототехнике или для собеседования в стартапы.</div></div>` },
      ],
    },

    // -------------------- Unitree G1 / Go2 --------------------
    {
      id: 'c_unitree',
      slug: 'unitree-humanoid-quadruped',
      categoryKey: 'cat.robotics',
      levelKey: 'level.expert',
      durationWeeks: 10,
      hours: 50,
      students: 156,
      rating: 5.0,
      featured: true,
      cover: 'unitree',
      title: ml(
        'Unitree G1 и Go2: программирование роботов будущего',
        'Unitree G1 және Go2: болашақ роботтарын бағдарламалау',
        'Unitree G1 & Go2: Programming the Robots of Tomorrow'
      ),
      tagline: ml(
        'Гуманоидный G1 и четвероногий Go2 — реальная работа с самыми передовыми платформами',
        'Гуманоидты G1 және төрт аяқты Go2 — ең озық платформалармен нақты жұмыс',
        'Humanoid G1 and quadruped Go2 — hands-on with cutting-edge platforms'
      ),
      description: ml(
        'Эксклюзивный курс USTEM Academy: программирование роботов Unitree G1 (гуманоид) и Go2 (четвероногий). Учимся управлять локомоцией, использовать встроенный AI, интегрировать с ROS 2, работать с лидаром и камерами роботов. Лаборатория академии оснащена двумя G1 и тремя Go2 — все занятия включают практику на реальных платформах. Курс уровня "эксперт" для тех, кто прошёл ROS.',
        'USTEM Academy эксклюзивті курсы: Unitree G1 (гуманоид) және Go2 (төрт аяқты) роботтарын бағдарламалау. Локомоцияны басқару, кірістірілген AI-ды қолдану, ROS 2-мен интеграциялау, роботтардың лидары мен камераларымен жұмыс істеуді үйренеміз. Академия зертханасы екі G1 және үш Go2-мен жабдықталған — барлық сабақтар нақты платформалардағы тәжірибені қамтиды.',
        'USTEM Academy exclusive course: programming Unitree G1 (humanoid) and Go2 (quadruped) robots. Learn locomotion control, use built-in AI, integrate with ROS 2, work with the robots LIDAR and cameras. The academy lab is equipped with two G1 units and three Go2 units — all sessions include hands-on practice on real platforms. Expert-level course for those who have completed ROS.'
      ),
      objectives: [
        ml('Управлять Go2 через Unitree SDK', 'Unitree SDK арқылы Go2 басқару', 'Control Go2 via Unitree SDK'),
        ml('Программировать локомоцию гуманоида G1', 'G1 гуманоидтың локомоциясын бағдарламалау', 'Program locomotion for the G1 humanoid'),
        ml('Использовать встроенный AI (распознавание, slam)', 'Кірістірілген AI-ды қолдану (тану, slam)', 'Use built-in AI (recognition, SLAM)'),
        ml('Интегрировать роботы с внешним ROS 2 узлом', 'Роботтарды сыртқы ROS 2 түйінімен интеграциялау', 'Integrate robots with external ROS 2 nodes'),
        ml('Реализовать сложные сценарии: патруль, перенос предметов', 'Күрделі сценарийлерді іске асыру: патруль, заттарды тасу', 'Implement complex scenarios: patrol, item transport'),
      ],
      instructor: {
        name: 'Алишер Серикбаев',
        avatar: 'А',
        role: ml('Humanoid Robotics Researcher', 'Гуманоидты робототехника зерттеушісі', 'Humanoid Robotics Researcher'),
        bio: ml(
          'PhD из ETH Zurich. Стажировался в Unitree Robotics (Шанхай). Возглавляет лабораторию гуманоидных роботов USTEM Academy.',
          'ETH Zurich PhD. Unitree Robotics (Шанхай) тағылымдамасынан өткен. USTEM Academy гуманоидты роботтар зертханасының жетекшісі.',
          'PhD from ETH Zurich. Interned at Unitree Robotics (Shanghai). Leads the humanoid robotics lab at USTEM Academy.'
        ),
      },
      lessons: [
        { id: 'l_uni_1', duration: 35, type: 'video', title: ml('Знакомство с Unitree: G1 и Go2','Unitree-мен танысу: G1 және Go2','Meet Unitree: G1 and Go2'), content: `<h2>Unitree Robotics: лидер доступной робототехники</h2>
<p>Unitree Robotics (Ханчжоу, Китай) — компания, которая сделала революцию: их роботы стоят в 5-10 раз дешевле аналогов от Boston Dynamics, при сравнимых возможностях.</p>
<h3>Unitree Go2 — четвероногий</h3>
<ul>
  <li><strong>Габариты:</strong> 70 × 31 × 40 см</li>
  <li><strong>Вес:</strong> 15 кг</li>
  <li><strong>DOF:</strong> 12 (по 3 на лапу)</li>
  <li><strong>Скорость:</strong> до 3.7 м/с (~13 км/ч)</li>
  <li><strong>Заряд:</strong> 2-4 часа работы</li>
  <li><strong>Сенсоры:</strong> 4D LIDAR L1 360°, RGB-камера, IMU</li>
  <li><strong>Контроллер:</strong> NVIDIA Jetson Orin Nano (EDU версия)</li>
  <li><strong>Цена:</strong> от $2,800 (Air) до $15,000 (EDU Plus)</li>
</ul>
<h3>Unitree G1 — гуманоид</h3>
<ul>
  <li><strong>Рост:</strong> 132 см</li>
  <li><strong>Вес:</strong> 35 кг</li>
  <li><strong>DOF:</strong> 23 (с руками) или 29 (с кистями)</li>
  <li><strong>Скорость:</strong> до 2 м/с</li>
  <li><strong>Заряд:</strong> ~2 часа</li>
  <li><strong>Камера:</strong> Intel RealSense D435i (RGB-D)</li>
  <li><strong>LIDAR:</strong> Livox MID-360 (3D 360°)</li>
  <li><strong>Цена:</strong> от $16,000</li>
</ul>
<h3>Лаборатория USTEM Academy</h3>
<p>В нашей лаборатории доступны:</p>
<ul>
  <li>2 × Unitree G1 EDU</li>
  <li>3 × Unitree Go2 EDU Plus</li>
  <li>Поле 6×8 м с препятствиями</li>
  <li>Зона безопасности с мягким полом</li>
  <li>Workstation Linux с предустановленным SDK</li>
</ul>
<h3>Что вы научитесь делать</h3>
<p>За 10 недель курса вы будете:</p>
<ol>
  <li>Безопасно работать с роботами в лаборатории</li>
  <li>Управлять Go2 через SDK</li>
  <li>Программировать локомоцию G1</li>
  <li>Интегрировать с ROS 2</li>
  <li>Использовать встроенное компьютерное зрение</li>
  <li>Реализовать собственные миссии</li>
</ol>
<div class="callout"><span>🦾</span><div>Unitree G1 стал «iPhone момент» для гуманоидной робототехники: первый доступный массовому исследователю humanoid. Опыт работы с ним — большое преимущество для карьеры.</div></div>` },
        { id: 'l_uni_2', duration: 45, type: 'video', title: ml('Безопасная работа с роботами','Роботтармен қауіпсіз жұмыс','Safe operation of robots'), content: `<h2>Безопасность — главный приоритет</h2>
<p>Unitree G1 и Go2 — серьёзные машины. G1 весит 35 кг и может двигаться с непредсказуемой силой, Go2 — 15 кг с моторами до 90 Нм крутящего момента. Несоблюдение протоколов = травмы или поломка робота на миллионы.</p>
<h3>Перед каждой сессией</h3>
<ol>
  <li>Проверка заряда батарей (минимум 30%)</li>
  <li>Визуальный осмотр на повреждения суставов и кабелей</li>
  <li>Подключение E-stop (кнопки экстренной остановки) — обязательно</li>
  <li>Очистка рабочей зоны от посторонних предметов</li>
  <li>Все участники в защитных очках</li>
  <li>Журнал сессии заполняется и подписывается</li>
</ol>
<h3>Зоны безопасности</h3>
<ul>
  <li><strong>Зелёная зона</strong> (за барьером) — наблюдатели, операторы с E-stop</li>
  <li><strong>Жёлтая зона</strong> (1 м от робота) — только инструктор</li>
  <li><strong>Красная зона</strong> (касание робота) — запрещено во время работы</li>
</ul>
<h3>Правила работы с G1 (humanoid)</h3>
<ul>
  <li>Никогда не запускайте G1 без страховочного троса (для первых сессий)</li>
  <li>Перед первым шагом — оператор «держит» через приложение</li>
  <li>При нестабильности — немедленно E-stop</li>
  <li>Минимум 2 м свободного пространства вокруг</li>
  <li>Не оставлять без присмотра</li>
</ul>
<h3>Правила работы с Go2 (четвероногий)</h3>
<ul>
  <li>Go2 устойчивее, но непредсказуемее на бегу</li>
  <li>Не подходите спереди — там «slot» для LIDAR, может зацепить</li>
  <li>Не поднимайте робота во время работы моторов</li>
  <li>Если упал — нажмите E-stop, не пытайтесь поднять руками</li>
</ul>
<h3>Электрическая безопасность</h3>
<ul>
  <li>Аккумуляторы LiPo — никогда не оставляйте заряжаться без присмотра</li>
  <li>Не разряжайте ниже 20% — повреждает батарею</li>
  <li>Поврежденная батарея = немедленная замена</li>
</ul>
<h3>В случае инцидента</h3>
<ol>
  <li>E-stop</li>
  <li>Удалить людей из зоны</li>
  <li>Сообщить инструктору</li>
  <li>Документировать в журнал</li>
  <li>Не возобновлять работу до анализа</li>
</ol>
<div class="callout"><span>⚠️</span><div>Это самый важный урок курса. Прежде чем взять SDK в руки, вы должны пройти зачёт по безопасности. Без этого допуск к роботам закрыт.</div></div>` },
        { id: 'l_uni_3', duration: 60, type: 'video', title: ml('Unitree SDK: первая команда','Unitree SDK: алғашқы пәрмен','Unitree SDK: first command'), content: `<h2>Unitree SDK 2 — API роботов</h2>
<p>SDK Unitree даёт прямой доступ к управлению: суставы, скорость, режимы локомоции. Доступен для Python и C++.</p>
<h3>Установка SDK</h3>
<pre><code># C++
git clone https://github.com/unitreerobotics/unitree_sdk2.git
cd unitree_sdk2 &amp;&amp; mkdir build &amp;&amp; cd build
cmake .. &amp;&amp; make -j4 &amp;&amp; sudo make install

# Python
pip install unitree_sdk2py</code></pre>
<h3>Подключение к Go2</h3>
<p>Робот и ваш компьютер должны быть в одной сети. Подключитесь по Ethernet или через WiFi (Go2 имеет точку доступа).</p>
<pre><code>from unitree_sdk2py.core.channel import ChannelFactoryInitialize
from unitree_sdk2py.go2.sport.sport_client import SportClient

# Инициализация (eth0 — имя интерфейса)
ChannelFactoryInitialize(0, "eth0")

# Создание клиента
sport = SportClient()
sport.SetTimeout(10.0)
sport.Init()

# Проверка связи — получить состояние
state = sport.GetState()
print(f"Robot mode: {state.mode}")
print(f"Battery: {state.battery_percent}%")</code></pre>
<h3>Базовые команды для Go2</h3>
<pre><code># Встать (если робот лежит)
sport.StandUp()

# Лечь
sport.StandDown()

# Подвигаться (vx, vy, vyaw) — вперёд, вбок, поворот
sport.Move(0.3, 0.0, 0.0)  # вперёд со скоростью 0.3 м/с
import time; time.sleep(3)
sport.StopMove()

# Сесть как собака
sport.Sit()

# Поприветствовать (помахать лапой)
sport.Hello()

# Сделать сальто (только с свободного места!)
sport.FrontFlip()</code></pre>
<h3>Режимы (Sport Modes)</h3>
<ul>
  <li><strong>Normal</strong> — стандартная ходьба</li>
  <li><strong>Sport</strong> — быстрая, динамичная</li>
  <li><strong>Stand</strong> — стоит на месте</li>
  <li><strong>Damping</strong> — суставы расслаблены (для переноски)</li>
  <li><strong>Custom</strong> — низкоуровневый контроль каждого сустава</li>
</ul>
<h3>Низкоуровневый контроль</h3>
<p>Для исследований используется Low-Level Control — управление углами и крутящими моментами каждого сустава напрямую. Это позволяет реализовывать свои походки и алгоритмы.</p>
<pre><code>from unitree_sdk2py.go2.low_state.low_state_client import LowStateClient
from unitree_sdk2py.go2.low_cmd.low_cmd_publisher import LowCmdPublisher

# Опасно для новичков — требует понимания динамики
# Сначала освойте Sport API, потом переходите к Low-Level</code></pre>
<div class="callout"><span>🐕</span><div>Sport API безопасен — у него встроенные ограничения и автостабилизация. Начинайте с него, переходите к Low-Level только когда понимаете, что делаете.</div></div>` },
        { id: 'l_uni_4', duration: 70, type: 'video', title: ml('Локомоция Go2: походки и трюки','Go2 локомоциясы: жүрістер мен трюктер','Go2 locomotion: gaits and tricks'), content: `<h2>Походки четвероногих</h2>
<p>Четвероногие животные используют разные походки в зависимости от скорости и местности. Go2 умеет имитировать большинство из них.</p>
<h3>Основные походки</h3>
<ul>
  <li><strong>Walk (шаг)</strong> — одна лапа в воздухе, три на земле. Самая стабильная. До 0.5 м/с</li>
  <li><strong>Trot (рысь)</strong> — диагональные пары лап двигаются вместе. Энергоэффективная. До 1.5 м/с</li>
  <li><strong>Pace (иноходь)</strong> — лапы одной стороны двигаются вместе. Редко используется</li>
  <li><strong>Bound (галоп)</strong> — передние и задние пары лап двигаются вместе. Быстро, но менее устойчиво. До 3.7 м/с</li>
  <li><strong>Pronk (прыжок)</strong> — все 4 лапы синхронно. «Олень-походка»</li>
</ul>
<h3>Switching между походками</h3>
<pre><code># Установить походку
sport.SwitchGait(0)  # 0=trot, 1=walk, 2=bound

# Скорость переключает походку автоматически
sport.Move(2.5, 0, 0)  # перейдёт в bound</code></pre>
<h3>Стэнс — позы стояния</h3>
<ul>
  <li><strong>Standard stance</strong> — обычное положение</li>
  <li><strong>Tilt</strong> — наклон корпуса вперёд/назад/в сторону</li>
  <li><strong>Roll</strong> — крен (для камеры)</li>
  <li><strong>Pitch</strong> — наклон головы</li>
</ul>
<pre><code># Наклонить корпус для лучшего обзора камеры
sport.Euler(roll=0, pitch=0.3, yaw=0)</code></pre>
<h3>Динамические манёвры (Sport Mode)</h3>
<pre><code>sport.FrontFlip()       # переднее сальто
sport.BackFlip()        # заднее сальто
sport.Dance1()          # анимация танца
sport.Hello()           # помахать лапой
sport.Heart()           # сердечко из лап</code></pre>
<h3>Адаптация к местности</h3>
<p>Встроенный контроллер баланса автоматически адаптируется к:</p>
<ul>
  <li>Наклонным поверхностям до 30°</li>
  <li>Ступенькам высотой до 12 см</li>
  <li>Мягким поверхностям (трава, песок)</li>
  <li>Препятствиям (благодаря LIDAR)</li>
</ul>
<h3>Реактивная стабильность</h3>
<p>Если толкнуть Go2 на полном ходу, он быстро восстанавливает баланс. Это результат работы Model Predictive Control (MPC), бегущего на 1000 Гц на встроенном DSP.</p>
<h3>Энергопотребление по походкам</h3>
<table style="width:100%;border-collapse:collapse;margin:1rem 0">
  <tr style="background:#f1f5f9"><th style="padding:8px;border:1px solid #e2e8f0">Походка</th><th style="padding:8px;border:1px solid #e2e8f0">Скорость</th><th style="padding:8px;border:1px solid #e2e8f0">Энергия</th></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0">Walk</td><td style="padding:8px;border:1px solid #e2e8f0">0.3 м/с</td><td style="padding:8px;border:1px solid #e2e8f0">~80 Вт</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0">Trot</td><td style="padding:8px;border:1px solid #e2e8f0">1.0 м/с</td><td style="padding:8px;border:1px solid #e2e8f0">~150 Вт</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0">Bound</td><td style="padding:8px;border:1px solid #e2e8f0">3.5 м/с</td><td style="padding:8px;border:1px solid #e2e8f0">~400 Вт</td></tr>
</table>
<div class="callout"><span>🏃</span><div>Trot — самая универсальная походка. Используйте её для большинства задач. Bound и Flip — для демонстраций.</div></div>` },
        { id: 'l_uni_5', duration: 80, type: 'video', title: ml('Гуманоидная локомоция G1','G1 гуманоидты локомоциясы','G1 humanoid locomotion'), content: `<h2>Гуманоид G1: ходьба и баланс</h2>
<p>Гуманоидная локомоция в десять раз сложнее четвероногой. Робот стоит всего на двух точках опоры, и центр масс расположен высоко.</p>
<h3>Почему ходьба двуногих сложна</h3>
<ul>
  <li>Точка опоры периодически — одна нога, периодически — две</li>
  <li>Маленькая площадь поддержки (стопы)</li>
  <li>Высокий центр масс</li>
  <li>Нужно постоянно «падать вперёд» контролируемо</li>
</ul>
<h3>Концепция Zero Moment Point (ZMP)</h3>
<p>Робот сохраняет баланс, держа ZMP (точка, где сила реакции опоры даёт нулевой момент) внутри support polygon (площади между стопами). G1 рассчитывает это 1000 раз в секунду.</p>
<h3>Включение режима локомоции</h3>
<pre><code>from unitree_sdk2py.g1.loco.g1_loco_client import LocoClient

ChannelFactoryInitialize(0, "eth0")
loco = LocoClient()
loco.Init()

# G1 стартует в режиме "Damp" (расслаблен)
loco.SetFsmId(2)  # Lock (заморозить позу)
loco.SetFsmId(4)  # Stand (встать)
# Сейчас G1 стоит и балансирует

# Ходьба
loco.Move(0.3, 0, 0)  # вперёд 0.3 м/с
time.sleep(5)
loco.StopMove()

# Сесть (для отдыха или транспортировки)
loco.SetFsmId(3)  # Damp
loco.Sit()</code></pre>
<h3>FSM (Finite State Machine) состояния G1</h3>
<table style="width:100%;border-collapse:collapse;margin:1rem 0">
  <tr style="background:#f1f5f9"><th style="padding:8px;border:1px solid #e2e8f0">ID</th><th style="padding:8px;border:1px solid #e2e8f0">Состояние</th><th style="padding:8px;border:1px solid #e2e8f0">Описание</th></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0">0</td><td style="padding:8px;border:1px solid #e2e8f0">ZeroTorque</td><td style="padding:8px;border:1px solid #e2e8f0">Все суставы расслаблены</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0">1</td><td style="padding:8px;border:1px solid #e2e8f0">Damp</td><td style="padding:8px;border:1px solid #e2e8f0">Демпфирование — робот можно толкать</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0">2</td><td style="padding:8px;border:1px solid #e2e8f0">Lock</td><td style="padding:8px;border:1px solid #e2e8f0">Заморозить текущую позу</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0">4</td><td style="padding:8px;border:1px solid #e2e8f0">Stand</td><td style="padding:8px;border:1px solid #e2e8f0">Стоит, готов к ходьбе</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0">200</td><td style="padding:8px;border:1px solid #e2e8f0">Walk</td><td style="padding:8px;border:1px solid #e2e8f0">Режим ходьбы</td></tr>
</table>
<h3>Whole-Body Control (WBC)</h3>
<p>G1 умеет координировать всё тело одновременно. Например, чтобы дотянуться до объекта далеко, он наклонит торс. Это делается алгоритмом WBC, который решает задачу оптимизации в реальном времени.</p>
<h3>Управление руками</h3>
<pre><code>from unitree_sdk2py.g1.arm.g1_arm_client import G1ArmClient

arm = G1ArmClient()
arm.Init()

# Поднять правую руку
arm.SetWristTargetPose(side="right",
    pos=[0.3, -0.2, 0.3],
    quat=[1, 0, 0, 0])</code></pre>
<h3>Ограничения G1</h3>
<ul>
  <li>Не бегает (только ходит, до 2 м/с)</li>
  <li>Не прыгает (риск падения)</li>
  <li>Не поднимает тяжести &gt; 3 кг каждой рукой</li>
  <li>Не работает на скользких поверхностях</li>
  <li>Заряд держит ~2 часа активной работы</li>
</ul>
<div class="callout"><span>🚶</span><div>Гуманоидная робототехника — самая активно развивающаяся область в 2026 году. Tesla Optimus, Figure 02, Boston Dynamics Atlas — все используют похожие принципы. Освоив G1, вы понимаете всю отрасль.</div></div>` },
        { id: 'l_uni_6', duration: 65, type: 'video', title: ml('Восприятие: 3D LIDAR и камеры','Қабылдау: 3D LIDAR және камералар','Perception: 3D LIDAR and cameras'), content: `<h2>Восприятие мира роботом</h2>
<p>Чтобы робот мог действовать осмысленно, он должен видеть мир. У Go2 и G1 есть несколько сенсоров.</p>
<h3>Сенсоры Go2</h3>
<ul>
  <li><strong>4D LIDAR L1</strong> — 360° сканирование, 21,600 точек/сек, дальность 4-25 м</li>
  <li><strong>RGB-камера</strong> широкоугольная, 1920×1080</li>
  <li><strong>IMU</strong> 9-осевой</li>
  <li><strong>Микрофоны</strong> массив 4 шт.</li>
</ul>
<h3>Сенсоры G1</h3>
<ul>
  <li><strong>Livox MID-360</strong> — 3D LIDAR 360°, 200k точек/сек, дальность до 70 м</li>
  <li><strong>Intel RealSense D435i</strong> — RGB-D камера, 1280×720 + глубина</li>
  <li><strong>4 камеры обзора</strong> по углам корпуса</li>
  <li><strong>IMU</strong> 9-осевой, ZED 2i для слежения</li>
</ul>
<h3>Чтение LIDAR в Python</h3>
<pre><code>from unitree_sdk2py.go2.sport.sport_client import SportClient
import numpy as np

# LIDAR публикует point cloud
def lidar_callback(cloud):
    # cloud — numpy array (N, 3): x, y, z для каждой точки
    points = np.array(cloud.points)
    distances = np.linalg.norm(points, axis=1)

    # Ближайшая точка
    min_dist = np.min(distances)
    print(f"Closest object: {min_dist:.2f} m")

# Подписка
sport.SubscribeLidar(lidar_callback)</code></pre>
<h3>RGB камера + детекция</h3>
<pre><code>import cv2
import numpy as np
from ultralytics import YOLO

# YOLOv8n — лёгкая модель, бежит на Jetson
model = YOLO('yolov8n.pt')

def camera_callback(frame):
    # frame — numpy (H, W, 3)
    results = model(frame, conf=0.5)

    for r in results:
        boxes = r.boxes.xyxy.cpu().numpy()
        classes = r.boxes.cls.cpu().numpy()

        for box, cls in zip(boxes, classes):
            if cls == 0:  # человек
                x1, y1, x2, y2 = box
                center_x = (x1 + x2) / 2
                # Если человек смещён вправо — поверни робота
                if center_x &gt; frame.shape[1] / 2 + 100:
                    sport.Move(0, 0, -0.3)  # поворот вправо</code></pre>
<h3>3D объектное обнаружение</h3>
<p>Самые передовые роботы используют 3D-детекцию: комбинируют LIDAR point cloud + RGB изображение, чтобы получить координаты объектов в пространстве.</p>
<h3>SLAM на встроенном железе</h3>
<p>Go2 и G1 имеют встроенный SLAM, который работает прямо на Jetson. Карта доступна через SDK:</p>
<pre><code># Получить текущую карту
map_data = sport.GetMap()
# map_data — занятая/свободная сетка

# Получить позицию робота
pose = sport.GetState().position
print(f"Pose: x={pose.x}, y={pose.y}, yaw={pose.yaw}")</code></pre>
<h3>Облачная обработка</h3>
<p>Для сложных задач (например, генерации описаний сцены через GPT-Vision) можно отправлять данные в облако. Unitree предлагает интеграцию с DeepSeek и Qwen для робота.</p>
<div class="callout"><span>👁</span><div>Сочетание LIDAR + камера + IMU даёт роботу полное восприятие. LIDAR — для геометрии, камера — для семантики, IMU — для движения.</div></div>` },
        { id: 'l_uni_7', duration: 75, type: 'video', title: ml('ROS 2 + Unitree интеграция','ROS 2 + Unitree интеграция','ROS 2 + Unitree integration'), content: `<h2>Интеграция Unitree с ROS 2</h2>
<p>SDK Unitree удобен, но если вы строите большую систему — лучше использовать ROS 2. Это даст вам совместимость со всеми инструментами экосистемы (Nav2, MoveIt, RViz).</p>
<h3>Установка моста</h3>
<p>Unitree предоставляет официальный ROS 2 wrapper:</p>
<pre><code>cd ~/ros2_ws/src
git clone https://github.com/unitreerobotics/unitree_ros2.git
cd ~/ros2_ws &amp;&amp; colcon build
source install/setup.bash

# Запустить мост
ros2 launch unitree_ros2 go2_bringup.launch.py \\
    network_interface:=eth0</code></pre>
<h3>Доступные топики Go2 в ROS 2</h3>
<ul>
  <li><code>/lf/odometry</code> — одометрия</li>
  <li><code>/utlidar/cloud</code> — point cloud с LIDAR</li>
  <li><code>/utlidar/imu</code> — IMU</li>
  <li><code>/utlidar/odometry</code> — встроенный SLAM</li>
  <li><code>/sportmodestate</code> — текущее состояние робота</li>
  <li><code>/cmd_vel</code> — команды управления</li>
</ul>
<h3>Простая нода для управления</h3>
<pre><code>import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist

class Go2Controller(Node):
    def __init__(self):
        super().__init__('go2_controller')
        self.pub = self.create_publisher(Twist, '/cmd_vel', 10)
        self.create_timer(0.1, self.tick)
        self.start = self.get_clock().now()

    def tick(self):
        elapsed = (self.get_clock().now() - self.start).nanoseconds * 1e-9
        msg = Twist()
        if elapsed &lt; 3:
            msg.linear.x = 0.3   # вперёд 3 сек
        elif elapsed &lt; 6:
            msg.angular.z = 0.5  # поворот 3 сек
        else:
            msg = Twist()  # стоп

        self.pub.publish(msg)

rclpy.init()
rclpy.spin(Go2Controller())</code></pre>
<h3>Объединение с Nav2</h3>
<p>Имея ROS 2 топики, Go2 можно подключить к Nav2 как любой mobile robot:</p>
<pre><code>ros2 launch nav2_bringup bringup_launch.py \\
    use_sim_time:=false \\
    map:=$HOME/maps/office.yaml \\
    params_file:=$HOME/nav2_go2_params.yaml</code></pre>
<p>Теперь Go2 принимает Nav2 Goals и едет автономно к точкам на карте.</p>
<h3>Visualization в RViz</h3>
<p>RViz 2 — мощный инструмент для дебага. Запустите его и подпишитесь на топики:</p>
<ul>
  <li>LIDAR cloud — увидите облако точек</li>
  <li>TF — координаты всех суставов</li>
  <li>RobotModel — 3D-модель робота</li>
  <li>Path — планируемый путь Nav2</li>
</ul>
<h3>Распределённая система</h3>
<p>Унитри запускает ноды на встроенном Jetson. Тяжёлые ноды (например, нейросетки) можно запустить на внешнем GPU-сервере. ROS 2 DDS позволяет общаться по сети прозрачно.</p>
<pre><code># На сервере (с GPU):
export ROS_DOMAIN_ID=5
ros2 run my_pkg yolo_node

# На роботе:
export ROS_DOMAIN_ID=5
# Робот видит ноду на сервере, получает результаты YOLO</code></pre>
<div class="callout"><span>🔗</span><div>ROS 2 — это «клей», который связывает алгоритмы исследователя с роботами Unitree. Используйте его для серьёзных проектов.</div></div>` },
        { id: 'l_uni_8', duration: 150, type: 'project', title: ml('Финальный проект: автономный патруль','Қорытынды жоба: автономды патруль','Final project: autonomous patrol'), content: `<h2>Финал: команда из G1 и Go2</h2>
<p>Это вершина курса. Вы создаёте систему из двух роботов: Go2 патрулирует периметр лаборатории, G1 встречает гостей в холле и провожает к нужному кабинету.</p>
<h3>Сценарий</h3>
<ol>
  <li>Go2 совершает круг по лаборатории каждые 10 минут</li>
  <li>Если детектирует «незнакомого человека» (без бейджа), сообщает на сервер и продолжает патруль</li>
  <li>G1 ждёт в холле. Когда сенсор у двери срабатывает (приход гостя), G1 включается</li>
  <li>G1 спрашивает голосом: «Здравствуйте! К кому вы пришли?»</li>
  <li>Распознаёт ответ, ведёт гостя к нужному кабинету</li>
  <li>Возвращается на пост ожидания</li>
</ol>
<h3>Архитектура</h3>
<pre><code>           ┌─────────────────────────────┐
           │     Central Server (ROS 2)  │
           │  - Mission Coordinator       │
           │  - Map server                │
           │  - Speech-to-Text (Whisper)  │
           │  - LLM (Qwen-Local)          │
           └────────┬──────────────┬──────┘
                    │              │
                    ▼              ▼
            ┌──────────────┐  ┌──────────────┐
            │   Go2 EDU    │  │   G1 EDU     │
            │ - Patrol     │  │ - Greeter    │
            │ - Anomaly    │  │ - Navigate   │
            │   Detection  │  │ - Speech     │
            └──────────────┘  └──────────────┘</code></pre>
<h3>Этапы выполнения (4 недели)</h3>
<h4>Неделя 1: Картирование</h4>
<p>Постройте полную карту лаборатории. SLAM на Go2, проверка в RViz, сохранение и публикация на сервер.</p>
<h4>Неделя 2: Go2 патруль</h4>
<p>Реализуйте цикл патрулирования по 4 точкам. Добавьте YOLO-детекцию людей. Логируйте обнаружения в общую базу.</p>
<h4>Неделя 3: G1 голосовой интерфейс</h4>
<p>Интегрируйте Whisper для STT, локальный LLM (Qwen 7B на сервере) для понимания. Карта кабинетов в JSON. G1 ходит к указанному кабинету.</p>
<h4>Неделя 4: Интеграция и демо</h4>
<p>Связываем всё. Финальная демонстрация перед жюри академии и приглашёнными представителями индустрии.</p>
<h3>Команда</h3>
<p>Проект делается командой из 3-4 человек. Распределение:</p>
<ul>
  <li><strong>Robot Engineer</strong> — настройка Go2 и G1, low-level</li>
  <li><strong>Perception Engineer</strong> — YOLO, LIDAR, голосовое распознавание</li>
  <li><strong>Backend Engineer</strong> — сервер, ROS 2 интеграция, БД</li>
  <li><strong>Project Lead</strong> — координация, демо</li>
</ul>
<h3>Что сдать</h3>
<ol>
  <li>Полная демонстрация 30 минут на финальном дне</li>
  <li>GitHub репозиторий с README, инструкциями, диаграммами</li>
  <li>Технический отчёт 10-15 страниц</li>
  <li>Видео работы системы 3-5 минут</li>
  <li>Презентация для инвесторов (10 слайдов)</li>
</ol>
<h3>Бонусы (опционально)</h3>
<ul>
  <li>+ Распознавание лиц (FaceNet) для известных сотрудников</li>
  <li>+ Multilingual: G1 говорит на казахском, русском, английском</li>
  <li>+ Координация роботов через ROS 2 actions</li>
  <li>+ Web-дашборд для мониторинга</li>
</ul>
<h3>После курса</h3>
<p>Топ-команды получают:</p>
<ul>
  <li>Приглашение в исследовательскую лабораторию USTEM Academy</li>
  <li>Возможность работать с G1 и Go2 ещё 6 месяцев</li>
  <li>Рекомендательные письма от инструктора</li>
  <li>Контакты с компаниями, инвестирующими в робототехнику в КЗ</li>
</ul>
<div class="callout"><span>🏆</span><div>Этот проект — то, чем вы будете гордиться годами. Работа с современными гуманоидами — то, что 99% инженеров делают только на видео в YouTube.</div></div>` },
      ],
    },
  ],

  posts: [
    {
      id: 'p_robotics_lab_discussion',
      slug: 'robotics-lab-public-discussion-2026',
      categoryKey: 'post.cat.announcement',
      date: '2025-06-17T09:00:00Z',
      author: 'USTEM Academy',
      cover: 'announcement',
      coverImage: '',
      featured: true,
      status: 'published',
      tags: ['robotics-lab', 'public-discussion', 'teachers', 'professional-development'],
      title: ml(
        'Публичное обсуждение программы «Robotics Lab: робототехника в образовании»',
        '«Robotics Lab: білім берудегі робототехника» бағдарламасын жария талқылау',
        'Public Discussion: «Robotics Lab: Robotics in Education» Program'
      ),
      excerpt: ml(
        'ТОО «USTEM Academy» приглашает педагогов принять участие в обсуждении новой программы повышения квалификации по робототехнике, STEM и программированию. Срок — до 26 июня 2026 года.',
        '«USTEM Academy» ЖШС педагогтерді робототехника, STEM және бағдарламалау бойынша жаңа біліктілікті арттыру бағдарламасын талқылауға шақырады. Мерзім — 2026 жылғы 26 маусымына дейін.',
        'USTEM Academy invites educators to participate in discussion of the new professional development program in robotics, STEM, and programming. Deadline — June 26, 2026.'
      ),
      body: ml(
        `<h2>О программе</h2>
<p>ТОО <strong>«USTEM Academy»</strong> предлагает образовательную программу курса повышения квалификации <strong>«Robotics Lab: робототехника в образовании»</strong> для педагогов организаций среднего, технического и профессионального, послесреднего и дополнительного образования.</p>

<h3>Для кого эта программа</h3>
<p>Программа разработана для педагогов, реализующих или планирующих реализовывать:</p>
<ul>
  <li>занятия, кружки, факультативы по робототехнике</li>
  <li>проектные и практико-ориентированные курсы</li>
  <li>уроки STEM и программирования</li>
</ul>

<h3>Основные разделы программы</h3>
<ul>
  <li><strong>Нормативные основы</strong>, STEM-подход и безопасность в образовательной робототехнике</li>
  <li><strong>Основы робототехники</strong>: платформы LEGO Mindstorms EV3 и LEGO SPIKE Prime, механика и организация практической работы обучающихся</li>
  <li><strong>Программирование роботов</strong> и разработка учебных заданий по алгоритмическому мышлению</li>
  <li><strong>Методика преподавания</strong> робототехники и оценивание результатов обучающихся</li>
  <li><strong>Проектная и соревновательная робототехника</strong> в образовательной практике</li>
</ul>

<div class="callout"><span>📄</span><div><strong>Ознакомиться с программой:</strong> <a href="assets/docs/robotics-lab-ru.pdf" target="_blank" rel="noopener">RU ОП «Robotics Lab: робототехника в образовании» (PDF)</a></div></div>

<h2>Как принять участие в обсуждении</h2>
<p>Уважаемые педагоги! Просим Вас ответить на вопросы и оставить свои комментарии. Опрос направлен на сбор мнений и предложений педагогов для обсуждения проекта программы.</p>

<p style="text-align:center;margin:2rem 0">
<a href="https://forms.gle/Tg96KPdvf8Mjo2vB6" target="_blank" rel="noopener" style="display:inline-block;background:linear-gradient(135deg,#6d28d9,#2563eb);color:white;padding:14px 32px;border-radius:12px;font-weight:600;text-decoration:none;font-size:1.05rem;box-shadow:0 8px 20px -8px rgba(109,40,217,0.5)">📝 Перейти к опросу (RU)</a>
</p>

<div class="callout warning"><span>⏰</span><div><strong>Дедлайн:</strong> предложения принимаются до <strong>26 июня 2026 года</strong>.</div></div>`,
        `<h2>Бағдарлама туралы</h2>
<p><strong>«USTEM Academy»</strong> ЖШС орта, техникалық және кәсіптік, орта білімнен кейінгі және қосымша білім беру ұйымдарының педагогтеріне арналған <strong>«Robotics Lab: білім берудегі робототехника»</strong> біліктілікті арттыру курсының білім беру бағдарламасын ұсынады.</p>

<h3>Бағдарлама кімге арналған</h3>
<p>Бағдарлама педагогтерге арналған, олар:</p>
<ul>
  <li>робототехника бойынша сабақтарды, үйірмелерді, факультативтерді жүргізеді</li>
  <li>жобалық және практикаға бағдарланған курстарды ұйымдастырады</li>
  <li>STEM және бағдарламалау сабақтарын береді</li>
</ul>

<h3>Бағдарламаның негізгі бөлімдері</h3>
<ul>
  <li><strong>Нормативтік негіздер</strong>, STEM-тәсіл және білім беру робототехникасындағы қауіпсіздік</li>
  <li><strong>Робототехника негіздері</strong>: LEGO Mindstorms EV3 және LEGO SPIKE Prime платформалары, механика және білім алушылардың практикалық жұмысын ұйымдастыру</li>
  <li><strong>Роботтарды бағдарламалау</strong> және алгоритмдік ойлауға арналған оқу тапсырмаларын әзірлеу</li>
  <li><strong>Робототехниканы оқыту әдістемесі</strong> және білім алушылардың нәтижелерін бағалау</li>
  <li><strong>Білім беру практикасындағы жобалық және жарыстық робототехника</strong></li>
</ul>

<div class="callout"><span>📄</span><div><strong>Бағдарламамен танысу:</strong> <a href="assets/docs/robotics-lab-kz.pdf" target="_blank" rel="noopener">KZ ОП «Robotics Lab: білім берудегі робототехника» (PDF)</a></div></div>

<h2>Талқылауға қалай қатысу керек</h2>
<p>Құрметті педагогтер! Сұрақтарға жауап беріп, өз пікірлеріңіз бен ұсыныстарыңызды қалдыруыңызды сұраймыз. Сауалнама бағдарлама жобасын талқылау үшін педагогтердің пікірлерін жинауға бағытталған.</p>

<p style="text-align:center;margin:2rem 0">
<a href="https://forms.gle/PSZ91XMrbVcm78rQA" target="_blank" rel="noopener" style="display:inline-block;background:linear-gradient(135deg,#6d28d9,#2563eb);color:white;padding:14px 32px;border-radius:12px;font-weight:600;text-decoration:none;font-size:1.05rem;box-shadow:0 8px 20px -8px rgba(109,40,217,0.5)">📝 Сауалнамаға өту (KZ)</a>
</p>

<div class="callout warning"><span>⏰</span><div><strong>Мерзім:</strong> ұсыныстар <strong>2026 жылғы 26 маусымына дейін</strong> қабылданады.</div></div>`,
        `<h2>About the program</h2>
<p><strong>USTEM Academy LLP</strong> presents the professional development course program <strong>«Robotics Lab: Robotics in Education»</strong> for teachers in secondary, technical and vocational, post-secondary, and supplementary education organizations.</p>

<h3>Who is this program for</h3>
<p>The program is designed for teachers who run or plan to run:</p>
<ul>
  <li>robotics classes, clubs, and electives</li>
  <li>project-based and practice-oriented courses</li>
  <li>STEM and programming lessons</li>
</ul>

<h3>Main sections of the program</h3>
<ul>
  <li><strong>Regulatory foundations</strong>, STEM approach, and safety in educational robotics</li>
  <li><strong>Robotics fundamentals</strong>: LEGO Mindstorms EV3 and LEGO SPIKE Prime platforms, mechanics, and organization of student practical work</li>
  <li><strong>Robot programming</strong> and developing learning tasks for algorithmic thinking</li>
  <li><strong>Teaching methodology</strong> and student outcome assessment</li>
  <li><strong>Project-based and competitive robotics</strong> in educational practice</li>
</ul>

<div class="callout warning"><span>⏰</span><div><strong>Deadline:</strong> proposals are accepted until <strong>June 26, 2026</strong>. Survey is available in Russian and Kazakh — switch language above to see the correct form link.</div></div>`
      ),
    },
    {
      id: 'p_2',
      slug: 'platform-v6-update',
      categoryKey: 'post.cat.update',
      date: '2026-06-10T14:00:00Z',
      author: 'Команда платформы',
      cover: 'update',
      coverImage: '',
      featured: true,
      status: 'published',
      tags: ['platform', 'release'],
      title: ml(
        'Обновление платформы: блог, тесты, новый редактор',
        'Платформа жаңартуы: блог, тесттер, жаңа редактор',
        'Platform update: blog, quizzes, new editor'
      ),
      excerpt: ml(
        'Раскатили крупное обновление: появился раздел «Блог», расширили редактор уроков, добавили Drag-and-drop и шаблоны контента.',
        'Үлкен жаңарту шықты: «Блог» бөлімі пайда болды, сабақ редакторы кеңейтілді, Drag-and-drop және контент шаблондары қосылды.',
        'Major update rolled out: new "Blog" section, expanded lesson editor, drag-and-drop, content templates.'
      ),
      body: ml(
        `<h2>Что нового</h2>
<p>Платформа стала ещё ближе к идеальному инструменту для STEM-образования. Главные изменения:</p>
<h3>📖 Раздел «Блог»</h3>
<p>Теперь все объявления, новости, истории выпускников и обновления собраны в одном месте. Подписаться нельзя — но можно зайти и почитать.</p>
<h3>✍️ Расширенный редактор уроков</h3>
<ul>
  <li>WYSIWYG-редактор Quill вместо HTML-textarea</li>
  <li>Шаблоны блоков одним кликом: введение, цели, советы, таблицы, код, видео</li>
  <li>Поддержка 8 видео-платформ: YouTube, Vimeo, Rutube, Kinescope, VK, OK, Dzen, прямые MP4</li>
  <li>Подсветка синтаксиса для 13 языков программирования</li>
  <li>Drag-and-drop картинок прямо в редактор</li>
  <li>Счётчик слов и времени чтения</li>
</ul>
<h3>🎯 Управление курсами</h3>
<ul>
  <li>Drag-and-drop уроков в курсе</li>
  <li>Дублирование курсов одним кликом</li>
  <li>Экспорт/импорт курсов в JSON</li>
  <li>Поиск по курсам в админке</li>
  <li>Статусы Черновик / Опубликован</li>
</ul>
<div class="callout"><span>💡</span><div><strong>Совет:</strong> попробуйте новый редактор — откройте любой курс в админке и нажмите «Изм.» возле урока.</div></div>
<h3>Что дальше</h3>
<p>В планах: подписка на курсы по email, мобильное приложение, прокторинг для экзаменов, AI-ассистент для студентов.</p>`,
        `<h2>Жаңалықтар</h2><p>Платформа жетілдірілді.</p><h3>📖 «Блог» бөлімі</h3><p>Барлық хабарламалар бір жерде.</p>`,
        `<h2>What's new</h2><p>The platform got a major upgrade.</p><h3>📖 Blog section</h3><p>All announcements in one place.</p>`
      ),
    },
    {
      id: 'p_3',
      slug: 'ai-almaty-hackathon-results',
      categoryKey: 'post.cat.event',
      date: '2026-05-25T18:00:00Z',
      author: 'Динара Касымова',
      cover: 'event',
      coverImage: '',
      featured: true,
      status: 'published',
      tags: ['hackathon', 'ai', 'almaty'],
      title: ml(
        'Хакатон AI Almaty: 48 часов, $5000 призовых',
        'AI Almaty Хакатоны: 48 сағат, $5000 жүлде',
        'AI Almaty Hackathon: 48 hours, $5000 in prizes'
      ),
      excerpt: ml(
        'Подведены итоги хакатона. Победила команда школьников из Тараза с проектом распознавания аварий на дорогах.',
        'Хакатонның қорытындысы шығарылды. Жеңімпаз — Тараздан келген мектеп оқушыларының командасы.',
        'Hackathon results are in. Winners: a team of school students from Taraz with a road accident detection project.'
      ),
      body: ml(
        `<h2>Итоги хакатона</h2>
<p>В прошедшие выходные в Astana Hub собрались <strong>147 участников</strong> в 38 командах. За 48 часов команды должны были решить одну из трёх задач:</p>
<ul>
  <li><strong>Track 1:</strong> Компьютерное зрение для безопасности</li>
  <li><strong>Track 2:</strong> NLP для образования</li>
  <li><strong>Track 3:</strong> Прогнозные модели для агросектора</li>
</ul>
<h3>🥇 1 место — RoadGuard ($2500)</h3>
<p>Команда школьников 16–17 лет из Тараза разработала систему распознавания ДТП в реальном времени на основе YOLOv8 + Jetson Nano. Прототип уже тестируется городскими камерами.</p>
<h3>🥈 2 место — TildiAI ($1500)</h3>
<p>Студенты КБТУ создали голосового ассистента для изучения казахского языка с распознаванием произношения. Модель — fine-tuned Whisper.</p>
<h3>🥉 3 место — AgroSense ($1000)</h3>
<p>Команда из Уральска: прогноз урожая по спутниковым снимкам + локальным данным влажности. Точность 87% на тестовом сезоне.</p>
<div class="callout"><span>🎯</span><div>Все призёры получили приглашения на стажировки в Beeline, Kaspi и Astana Hub.</div></div>
<h3>Следующий хакатон</h3>
<p>AI Almaty Hackathon Autumn состоится <strong>15–17 ноября 2026</strong>. Тема — генеративный ИИ. Регистрация откроется в сентябре.</p>`,
        `<h2>Хакатон қорытындысы</h2><p>147 қатысушы, 38 команда, 48 сағат.</p>`,
        `<h2>Hackathon results</h2><p>147 participants, 38 teams, 48 hours.</p>`
      ),
    },
    {
      id: 'p_4',
      slug: 'stem-hanym-200-graduates',
      categoryKey: 'post.cat.story',
      date: '2026-05-18T12:00:00Z',
      author: 'Жанар Мендыбаева',
      cover: 'story',
      coverImage: '',
      featured: true,
      status: 'published',
      tags: ['stem-hanym', 'women', 'graduation'],
      title: ml(
        'STEM Hanym: 200 выпускниц поступили в IT-вузы',
        'STEM Hanym: 200 түлек IT ЖОО-ға түсті',
        'STEM Hanym: 200 graduates enrolled in IT universities'
      ),
      excerpt: ml(
        'Программа поддержки девушек в STEM достигла важной вехи. 87% наших выпускниц продолжают карьеру в технологиях.',
        'Қыздарға арналған STEM бағдарламасы маңызды кезеңге жетті. Біздің түлектердің 87%-ы технологияларда мансабын жалғастыруда.',
        'The STEM support program for girls hit a major milestone. 87% of our graduates continue careers in tech.'
      ),
      body: ml(
        `<h2>Прорыв года</h2>
<p>Сегодня я с гордостью объявляю: <strong>200 выпускниц программы STEM Hanym</strong> успешно поступили в технические вузы. Из них 130 — в Назарбаев Университет, КБТУ, КИМЭП, AlmaU и АИУ. Ещё 70 — в зарубежные вузы, включая Stanford, Carnegie Mellon, ETH Zürich и MIT.</p>
<h3>Истории</h3>
<p><strong>Айгерим из Шымкента</strong> начала программу в 14 лет, никогда не писав код. Сейчас она — студентка 2 курса CMU, стажируется в Google.</p>
<p><strong>Алина из Семея</strong> в первый день сказала: «Я ничего не понимаю в математике». Через год выиграла математическую олимпиаду Казахстана и сейчас изучает ML в КБТУ.</p>
<p><strong>Команда из Кызылорды</strong> создала AgroBot — приложение для фермеров с предсказанием влажности почвы. Получили инвестиции $100K на дальнейшее развитие.</p>
<div class="callout"><span>💜</span><div>Девиз STEM Hanym: «Ты не одна. Ты в сообществе. Ты способна.»</div></div>
<h3>Цифры</h3>
<ul>
  <li><strong>200</strong> выпускниц программы</li>
  <li><strong>87%</strong> продолжают карьеру в STEM</li>
  <li><strong>70</strong> менторок из IT-индустрии Казахстана</li>
  <li><strong>15</strong> социальных проектов запущено в этом году</li>
  <li><strong>$340K</strong> привлечено выпускницами в свои стартапы</li>
</ul>
<h3>Что дальше</h3>
<p>В сентябре стартует пятый поток STEM Hanym. Заявки принимаем до <strong>1 августа 2026</strong>. В этом году мы расширяемся на Караганду, Атырау и Кокшетау.</p>
<p><em>— Жанар Мендыбаева, основательница STEM Hanym</em></p>`,
        `<h2>Жылдың серпілісі</h2><p>STEM Hanym бағдарламасының 200 түлегі IT ЖОО-ға түсті.</p>`,
        `<h2>Year breakthrough</h2><p>200 STEM Hanym graduates enrolled in IT universities.</p>`
      ),
    },
    {
      id: 'p_5',
      slug: 'fll-world-festival-prep',
      categoryKey: 'post.cat.news',
      date: '2026-06-05T10:30:00Z',
      author: 'Алибек Ахметов',
      cover: 'news',
      coverImage: '',
      featured: false,
      status: 'published',
      tags: ['fll', 'competition', 'kazakhstan'],
      title: ml(
        'Сборная Казахстана едет на FLL World Festival в Хьюстон',
        'Қазақстан құрамасы Хьюстондағы FLL World Festival-ға барады',
        'Team Kazakhstan heading to FLL World Festival in Houston'
      ),
      excerpt: ml(
        'Три команды-победителя национального отбора FIRST LEGO League отправились на мировой финал. Желаем успехов!',
        'FIRST LEGO League ұлттық іріктеуінің үш жеңімпаз командасы әлем финалына аттанды.',
        'Three winning teams from the FIRST LEGO League national selection are heading to the world finals.'
      ),
      body: ml(
        `<h2>Победители едут в Хьюстон</h2>
<p>После национального финала FIRST LEGO League Kazakhstan, прошедшего в Алматы в конце мая, определились три команды, которые представят страну на <strong>FLL World Festival 2026</strong> в Хьюстоне (США):</p>
<ul>
  <li><strong>RoboKaragandy</strong> — команда из Караганды, 7 школьников 11–14 лет. Тренер: Айдай Аширбекова</li>
  <li><strong>Almaty Hawks</strong> — выпускники нашего курса FLL, второй год подряд в финале</li>
  <li><strong>Aktobe Innovators</strong> — дебютанты, прошедшие отбор с проектом «умная теплица»</li>
</ul>
<h3>Что их ждёт</h3>
<p>FLL World Festival 2026 пройдёт <strong>17–20 июля</strong> в NRG Stadium. На соревновании соберутся 108 команд из 90+ стран. Тема сезона — <em>SUBMERGED</em> (исследование океана).</p>
<div class="callout"><span>🏆</span><div>В 2024 году команда USTEM Academy заняла 2-е место на FLL World Festival в категории «Innovation Project».</div></div>
<h3>Как поддержать</h3>
<p>Подписывайтесь на наш канал в Telegram, чтобы следить за выступлениями в прямом эфире. Все три команды будут выходить на связь после своих матчей.</p>`,
        `<h2>Жеңімпаздар Хьюстонға аттанды</h2><p>Үш команда FLL World Festival-ға барады.</p>`,
        `<h2>Winners heading to Houston</h2><p>Three teams advance to FLL World Festival.</p>`
      ),
    },
  ],

  // Старый массив анонсов оставлен пустым (теперь главная использует посты блога)
  announcements: [],
};

// ---------- Storage Layer ----------

const Store = {
  init() {
    ['ustem_lms_v1', 'ustem_lms_v2', 'ustem_lms_v3', 'ustem_lms_v4', 'ustem_lms_v5', 'ustem_lms_v6', 'ustem_lms_v7', 'ustem_lms_v8', 'ustem_lms_v9'].forEach(k => {
      if (localStorage.getItem(k)) {
        localStorage.removeItem(k);
        localStorage.removeItem('ustem_session');
      }
    });
    if (!localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seedData));
    }
  },
  reset() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedData));
    localStorage.removeItem('ustem_session');
  },
  get all() { return JSON.parse(localStorage.getItem(STORAGE_KEY)); },
  save(data) { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); },
  getUsers() { return this.all.users; },
  getUserById(id) { return this.all.users.find(u => u.id === id); },
  getUserByEmail(email) { return this.all.users.find(u => u.email === email); },
  saveUser(user) {
    const data = this.all;
    const i = data.users.findIndex(u => u.id === user.id);
    if (i >= 0) data.users[i] = user;
    else data.users.push(user);
    this.save(data);
  },
  getCourses() { return this.all.courses; },
  getCourseById(id) { return this.all.courses.find(c => c.id === id); },
  saveCourse(course) {
    const data = this.all;
    const i = data.courses.findIndex(c => c.id === course.id);
    if (i >= 0) data.courses[i] = course;
    else data.courses.push(course);
    this.save(data);
  },
  deleteCourse(id) {
    const data = this.all;
    data.courses = data.courses.filter(c => c.id !== id);
    this.save(data);
  },
  getAnnouncements() { return this.all.announcements; },
  getPosts() { return this.all.posts || []; },
  getPostById(id) { return (this.all.posts || []).find(p => p.id === id); },
  getPostBySlug(slug) { return (this.all.posts || []).find(p => p.slug === slug); },
  savePost(post) {
    const data = this.all;
    if (!data.posts) data.posts = [];
    const i = data.posts.findIndex(p => p.id === post.id);
    if (i >= 0) data.posts[i] = post;
    else data.posts.unshift(post);
    this.save(data);
  },
  deletePost(id) {
    const data = this.all;
    data.posts = (data.posts || []).filter(p => p.id !== id);
    this.save(data);
  },
  getSession() {
    const raw = localStorage.getItem('ustem_session');
    if (!raw) return null;
    const session = JSON.parse(raw);
    return this.getUserById(session.userId);
  },
  setSession(userId) { localStorage.setItem('ustem_session', JSON.stringify({ userId })); },
  clearSession() { localStorage.removeItem('ustem_session'); },
};

Store.init();

window.Store = Store;
