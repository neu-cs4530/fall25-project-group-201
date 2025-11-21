interface PermissionCheckboxProps {
  permission: boolean;
  setPermission: React.Dispatch<React.SetStateAction<boolean>>;
}

const PermissionCheckbox = ({permission, setPermission}: PermissionCheckboxProps) => {
  return (
    <div className="form-check form-switch">
      <input 
        className="form-check-input" 
        checked={permission}
        onChange={(e) => {
          console.log('Checkbox changed to: ', e.target.checked)
          setPermission(e.target.checked)
        }}    
        type="checkbox" 
        role="switch" 
        id="switchCheckChecked" 
      />
      <label className="form-check-label" htmlFor="switchCheckChecked">Allow others to download model</label>
    </div>
  );
};

export default PermissionCheckbox;