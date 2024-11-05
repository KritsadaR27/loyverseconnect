import DateFilter from './DateFilter';

export default function MyComponent() {
    const handleSelectChange = (option) => {
        console.log("Selected option:", option);
    };

    const handleDaysChange = (days) => {
        console.log("Selected days:", days);
    };

    return (
        <DateFilter
            label="เลือกช่วงวันที่"
            defaultOption="selectDays"
            defaultDays={[]}
            onSelectChange={handleSelectChange}
            onDaysChange={handleDaysChange}
        />
    );
}
