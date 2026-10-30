CREATE TABLE APUS_opening_balance (
    [Emp Code] VARCHAR(512),
    [Name] VARCHAR(512),
    [As on Date] VARCHAR(512),
    [ Accrued Days] INT,
    [Opening Balance(Amount in AED)] FLOAT
);

INSERT INTO APUS_opening_balance
(
    [Emp Code],
    [Name],
    [As on Date],
    [ Accrued Days],
    [Opening Balance(Amount in AED)]
)
VALUES
    ('AE-0002', 'Anton ', '2026/09/30', '62', '122301.37'),
    ('AE-0003', 'Vladislav ', '2026/09/30', '22', '23868.49'),
    ('AE-0004', 'Artem ', '2026/09/30', '-6', '-8284.93'),
    ('AE-0005', 'Mikhail', '2026/09/30', '-1', '-1380.82'),
    ('AE-0006', 'Catarina ', '2026/09/30', '15', '5326.03'),
    ('AE-0007', 'Nishan ', '2026/09/30', '51', '5030.14'),
    ('AE-0008', 'Aymen ', '2026/09/30', '-7', '-8284.93'),
    ('AE-0009', 'Oleg ', '2026/09/30', '29', '31463.01'),
    ('AE-0010', 'Oleg ', '2026/09/30', '45', '75452.05'),
    ('AE-0011', 'Ekaterina ', '2026/09/30', '21', '27754.52'),
    ('AE-0012', 'Shebin ', '2026/09/30', '18', '7989.04'),
    ('AE-0013', 'Neeraja ', '2026/09/30', '11', '7594.52'),
    ('AE-0014', 'Jida ', '2026/09/30', '21', '6213.70'),
    ('AE-0015', 'Kishwar ', '2026/09/30', '1', '98.63'),
    ('AE-0016', 'Sally ', '2026/09/30', '21', '10356.16'),
    ('AE-0017', 'Sergei ', '2026/09/30', '6', '6509.59'),
    ('AE-0018', 'Alexander ', '2026/09/30', '7', '6213.70'),
    ('AE-0019', 'Haythem', '2026/09/30', '2', '4536.99');

INSERT INTO HRM_LEAVE_ACCRUAL (LAD_EMP_MASTER_DR,LAD_TYPE,LAD_SIGN,LAD_DATE,LAD_ACCRUED_DAYS,LAD_ACCRUED_AMT,LAD_GRAT_LEAV_TYPE,LAD_REMARK,LAD_EMP_PPD_DR,LAD_CREATED_USER,LAD_CREATED_DATE)

select emp_slno,'Opening Balance', CASE
        WHEN A. [As on Date] < 0
          OR A.[Opening Balance(Amount in AED)] < 0
        THEN -1
        ELSE 1
    END,'2026-09-30',abs([As on Date]) as diff,0,'LEAVE','UPLOADED FROM BACKEND',HRM_PAY_PERIOD_SLNO,36,getdate() FROM HRM_EMP_MASTER E JOIN APUS_opening_balance A ON E.EMP_CODE = A.[Emp Code]

join HRM_PAY_PERIODS on HRM_YEAR_SLNO = EMP_PAY_GROUP_DR and '2026-09-30' between HRM_PAY_PERIOD_START_DATE and HRM_PAY_PERIOD_END_DATE


 

