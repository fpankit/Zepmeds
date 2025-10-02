export interface Vaccine {
    name: string;
    protectsAgainst: string;
    dueDate: string;
    isDone: boolean;
}

export const vaccinationData: Vaccine[] = [
    {
        name: 'BCG, OPV-0, Hep-B 1',
        protectsAgainst: 'TB, Polio, Hepatitis B',
        dueDate: '2019-07-15',
        isDone: true,
    },
    {
        name: 'DTP 1, IPV 1, Hep-B 2, HiB 1, Rota 1, PCV 1',
        protectsAgainst: 'Multiple diseases',
        dueDate: '2019-09-01',
        isDone: true,
    },
    {
        name: 'DTP 2, IPV 2, HiB 2, Rota 2, PCV 2',
        protectsAgainst: 'Multiple diseases',
        dueDate: '2019-10-01',
        isDone: true,
    },
    {
        name: 'DTP 3, IPV 3, HiB 3, Rota 3, PCV 3',
        protectsAgainst: 'Multiple diseases',
        dueDate: '2019-11-01',
        isDone: true,
    },
    {
        name: 'OPV 1, Hep-B 3',
        protectsAgainst: 'Polio, Hepatitis B',
        dueDate: '2020-01-15',
        isDone: true,
    },
    {
        name: 'MMR 1, Typhoid Conjugate Vaccine',
        protectsAgainst: 'Mumps, Measles, Rubella, Typhoid',
        dueDate: '2020-04-15',
        isDone: false,
    },
    {
        name: 'Hep-A 1, PCV Booster',
        protectsAgainst: 'Hepatitis A, Pneumonia',
        dueDate: '2020-07-15',
        isDone: false,
    },
     {
        name: 'DTP Booster 1, IPV Booster 1, HiB Booster 1',
        protectsAgainst: 'Diphtheria, Tetanus, Pertussis',
        dueDate: '2021-01-15',
        isDone: false,
    },
    {
        name: 'MMR 2, Varicella 2, Hep-A 2',
        protectsAgainst: 'Mumps, Measles, Rubella, Chickenpox',
        dueDate: '2024-01-15',
        isDone: false,
    },
];
