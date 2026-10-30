CREATE TABLE [APUS_asset_isseu] (
    [Employee ID]	VARCHAR(512),
    [Employee Name]	VARCHAR(512),
    [Asset Code]	VARCHAR(512),
    [Asset Description ]	VARCHAR(512),
    [Asset Status ]	VARCHAR(512),
    [Issued Date ]	VARCHAR(512),
    [Asset Value ]	VARCHAR(512),
    [Asset Details ]	VARCHAR(512)
);

INSERT INTO [APUS_asset_isseu] ([Employee ID], [Employee Name], [Asset Code], [Asset Description ], [Asset Status ], [Issued Date ], [Asset Value ], [Asset Details ]) VALUES
    ('AE-0001', 'Eyas Alhomouz', 'Laptop', 'Lenovo X1 Gen12', 'New', '8/15/24', '7,000.00AED', 'PF51978L'),
    ('AE-0002', 'Anton  Gedroyts', 'Laptop', 'Lenovo X1 Gen12', 'New', '8/15/24', '7,000.00AED', 'PF51GQQB'),
    ('AE-0002', 'Anton  Gedroyts', 'Laptop', 'Dell Latitude 7440', 'New', '10/1/23', '5,000.00AED', '7T23FY3'),
    ('AE-0003', 'Vladislav  Brylin', 'Laptop', 'Dell Latitude 7440', 'New', '10/1/23', '5,000.00AED', '5BTJGY3'),
    ('AE-0003', 'Vladislav  Brylin', 'Mobile', 'iPhone 13', 'New', '4/5/24', '3,000.00AED', 'GCVMQFT25G'),
    ('AE-0004', 'Artem  Rabey ', 'Laptop', 'Dell Latitude 7440', 'New', '10/1/23', '5,000.00AED', '71TJGY3'),
    ('AE-0005', 'Mikhail Mosesyan', 'Laptop', 'Dell Latitude 7440', 'New', '10/1/23', '5,000.00AED', 'DW23FY3'),
    ('AE-0006', 'Catarina  Rosa', 'Laptop', 'Dell Latitude 7440', 'New', '10/1/23', '5,000.00AED', 'C8TJGY3'),
    ('AE-0006', 'Catarina  Rosa', 'Mobile', 'iPhone 13', 'New', '4/5/24', '3,000.00AED', 'C16RY4XF09'),
    ('AE-0008', 'Aymen  Jemai', 'Laptop', 'Dell Latitude 7440', 'New', '10/1/23', '5,000.00AED', '27TJGY3'),
    ('AE-0008', 'Aymen  Jemai', 'Mobile', 'iPhone 13', 'New', '4/5/24', '3,000.00AED', 'F46LFQJXGL'),
    ('AE-0009', 'Oleg  Cherkasov', 'Laptop', 'Lenovo X1 Gen12', 'New', '8/15/24', '7,000.00AED', 'PF51GQP5'),
    ('AE-0010', 'Oleg  Arefyev', 'Laptop', 'Lenovo X1 Gen12', 'New', '8/15/24', '7,000.00AED', 'PF519783'),
    ('AE-0011', 'Ekaterina  Rodnyanskaya', 'Laptop', 'Lenovo X1 Gen12', 'Used', '8/15/24', '7,000.00AED', 'PF518W6Z'),
    ('AE-0011', 'Ekaterina  Rodnyanskaya', 'Mobile', 'iPhone 13', 'New', '4/5/24', '3,000.00AED', 'G6L9YQYDWT'),
    ('AE-0012', 'Shebin  Sam', 'Laptop', 'Dell Latitude 7440', 'New', '10/1/23', '5,000.00AED', '7Q23FY3'),
    ('AE-0013', 'Neeraja  Rajeev', 'Laptop', 'Dell Latitude 7440', 'Used', '10/1/23', '5,000.00AED', '6H58DY3'),
    ('AE-0014', 'Jida  Al Sharabi', 'Laptop', 'Dell Latitude 7440', 'Used', '10/1/23', '5,000.00AED', '8X23FY3'),
    ('AE-0016', 'Sally  Badran', 'Laptop', 'Dell Latitude 7440', 'Used', '10/1/23', '5,000.00AED', 'J0TJGY3'),
    ('AE-0016', 'Sally  Badran', 'Mobile', 'iPhone 13', 'Used', '4/5/24', '3,000.00AED', 'HKD4M6NGFY'),
    ('AE-0018', 'Alexander  Lobanov', 'Laptop', 'Dell Latitude 7440', 'Used', '10/1/23', '5,000.00AED', 'B3TJGY3');

INSERT INTO dbo.HRM_EMP_ASSET
(
    EAS_EMP_MASTER_PR,
    EAS_ASSET_CATEGORY,
    EAS_ASSET_TYPE,
    EAS_ASSET_CC_DR,
    EAS_ASSET_STAT_CC_DR,
    EAS_REC_DATE,
    EAS_ASSET_VALUE,
    EAS_DETAIL,
    EAS_CREATED_USER,
    EAS_CREATED_DATE
)
SELECT
    E.EMP_SLNO AS EAS_EMP_MASTER_PR,
    CAT.COM_SLNO AS EAS_ASSET_CATEGORY,
    C1.COM_SLNO AS EAS_ASSET_TYPE,
    C2.COM_SLNO AS EAS_ASSET_CC_DR,
    C3.COM_SLNO AS EAS_ASSET_STAT_CC_DR,
    TRY_CONVERT(DATE, LTRIM(RTRIM(A.[Issued Date ])), 101) AS EAS_REC_DATE,
    TRY_CONVERT(
        DECIMAL(18,2),
        REPLACE(
            REPLACE(A.[Asset Value ], 'AED', ''),
            ',', ''
        )
    ) AS EAS_ASSET_VALUE,
    A.[Asset Details ] AS EAS_DETAIL,
    36 AS EAS_CREATED_USER,
    GETDATE() AS EAS_CREATED_DATE
FROM dbo.APUS_asset_isseu AS A
INNER JOIN dbo.HRM_EMP_MASTER AS E
    ON LTRIM(RTRIM(A.[Employee ID])) =
       LTRIM(RTRIM(E.EMP_CODE))
INNER JOIN dbo.COMMONCODES AS CAT
    ON LTRIM(RTRIM(CAT.COM_DESC)) = 'IT Asset'
INNER JOIN dbo.COMMONCODES AS C1
    ON LTRIM(RTRIM(A.[Asset Code])) =
       LTRIM(RTRIM(C1.COM_DESC))
INNER JOIN dbo.COMMONCODES AS C2
    ON LTRIM(RTRIM(A.[Asset Description ])) =
       LTRIM(RTRIM(C2.COM_DESC))
INNER JOIN dbo.COMMONCODES AS C3
    ON LTRIM(RTRIM(A.[Asset Status ])) =
       LTRIM(RTRIM(C3.COM_DESC));
   

